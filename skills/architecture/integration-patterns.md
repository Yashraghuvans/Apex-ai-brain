# Integration Patterns — REST, Platform Events, Outbound Messages

## HTTP Callouts — REST Integration

### Basic HttpRequest/HttpResponse Pattern

```apex
public class ExternalServiceClient {
    
    public static HttpResponse makeCallout(String endpoint, String body) {
        try {
            HttpRequest request = new HttpRequest();
            request.setEndpoint(endpoint);
            request.setMethod('POST');
            request.setHeader('Content-Type', 'application/json');
            request.setHeader('Authorization', 'Bearer ' + getAccessToken());
            request.setBody(body);
            request.setTimeout(10000); // 10 seconds
            
            Http http = new Http();
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() != 200) {
                throw new IntegrationException('API returned: ' + response.getStatusCode());
            }
            
            return response;
            
        } catch (HttpCalloutException e) {
            throw new IntegrationException('Callout failed: ' + e.getMessage(), e);
        }
    }
    
    private static String getAccessToken() {
        // Return token from external auth service
        return 'token_from_auth';
    }
}
```

### Named Credentials Pattern (Recommended)

Named Credentials store endpoint + authentication centrally.

```apex
// Setup → Named Credentials → Create one:
// Name: ExternalAPI
// URL: https://api.example.com
// Auth: OAuth 2.0

// Use it in code:
public class OrderServiceClient {
    
    public static HttpResponse createOrder(OrderData data) {
        HttpRequest request = new HttpRequest();
        
        // Reference named credential:
        request.setEndpoint('callout:ExternalAPI/v1/orders');
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');
        request.setBody(JSON.serialize(data));
        
        Http http = new Http();
        return http.send(request);
    }
}
```

### Mocking Callouts in Tests

```apex
@isTest
private class OrderServiceClientTest {
    
    @isTest
    static void testCreateOrderSuccess() {
        // Mock the HTTP response
        Test.setMock(HttpCalloutMock.class, new MockHttpResponse());
        
        Test.startTest();
        HttpResponse response = OrderServiceClient.createOrder(buildTestOrder());
        Test.stopTest();
        
        Assert.areEqual(200, response.getStatusCode());
    }
    
    // Mock implementation
    private class MockHttpResponse implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest request) {
            HttpResponse response = new HttpResponse();
            response.setHeader('Content-Type', 'application/json');
            response.setBody('{"orderId":"12345","status":"created"}');
            response.setStatusCode(200);
            return response;
        }
    }
}
```

## Error Handling & Retries

### Retry Pattern

```apex
public class ResilientApiClient {
    
    private static final Integer MAX_RETRIES = 3;
    private static final Integer BACKOFF_MS = 1000;
    
    public static HttpResponse callWithRetry(HttpRequest request) {
        Integer attempts = 0;
        HttpResponse response;
        
        while (attempts < MAX_RETRIES) {
            try {
                Http http = new Http();
                response = http.send(request);
                
                if (isSuccess(response)) {
                    return response;
                }
                
                if (isRetryable(response.getStatusCode())) {
                    attempts++;
                    wait(BACKOFF_MS * attempts); // Exponential backoff
                } else {
                    throw new IntegrationException('Non-retryable error: ' + response.getStatusCode());
                }
                
            } catch (HttpCalloutException e) {
                attempts++;
                if (attempts >= MAX_RETRIES) {
                    throw new IntegrationException('Max retries exceeded', e);
                }
                wait(BACKOFF_MS * attempts);
            }
        }
        
        throw new IntegrationException('Callout failed after retries');
    }
    
    private static Boolean isSuccess(HttpResponse response) {
        Integer status = response.getStatusCode();
        return status >= 200 && status < 300;
    }
    
    private static Boolean isRetryable(Integer statusCode) {
        // Retry on timeout, server errors, throttling
        Set<Integer> retryableCodes = new Set<Integer>{408, 429, 500, 502, 503, 504};
        return retryableCodes.contains(statusCode);
    }
    
    private static void wait(Integer ms) {
        Long startTime = System.currentTimeMillis();
        while (System.currentTimeMillis() - startTime < ms) {
            // Busy wait (or use scheduled action in production)
        }
    }
}
```

## Platform Events — Async Publish/Subscribe

Publish events asynchronously — subscribers execute in separate transaction.

### Publishing Events

```apex
public class OrderService {
    
    public static void publishOrderCreated(Order order) {
        Order_Created_Event__e event = new Order_Created_Event__e(
            Order_Id__c = order.Id,
            Customer_Id__c = order.AccountId,
            Amount__c = order.Amount,
            Status__c = 'Order_Created'
        );
        
        EventBus.publish(event);
        System.debug('Event published for order: ' + order.Id);
    }
}

// Subscriber trigger (fires async)
trigger OrderCreatedEventTrigger on Order_Created_Event__e (after insert) {
    for (Order_Created_Event__e event : Trigger.new) {
        // Log the event, trigger flows, etc
        System.debug('Order created: ' + event.Order_Id__c);
        
        // Could trigger a process that calls API
        OrderNotificationService.sendConfirmationEmail(event.Order_Id__c);
    }
}
```

### Benefits vs Queueable

| Aspect | Platform Event | Queueable |
|--------|---|--|
| Async | Yes | Yes |
| Reliable | ✅ Guaranteed delivery | ✅ Strong |
| Chainable | ❌ No | ✅ Yes |
| Trackable | ❌ Limited tracking | ✅ Returns job ID |
| Cross-org | ✅ Yes | ❌ No |
| Callouts | ✅ Yes | ✅ Yes |

## Outbound Messages (Legacy)

Traditional Salesforce outbound messaging (for sox compliance, audit).

```apex
// Setup → Outbound Messages → Create one
// Workflow sends HTTP POST when criteria matches
// Recipient must implement WSDL endpoint

// Acknowledgment in Apex:
@RestResource(urlMapping='/outbound-ack')
global class OutboundMessageAck {
    @HttpPost
    global static void handleMessage() {
        RestContext.response.addHeader('Content-Type', 'application/json');
        
        // Parse message from Salesforce
        // Respond with ACK
        Map<String, Object> response = new Map<String, Object>{
            'ackMessage' => 'OK'
        };
        
        RestContext.response.responseBody = Blob.valueOf(JSON.serialize(response));
    }
}
```

## Polling Pattern — Check for Changes

```apex
global class PollingBatch implements Database.Batchable<SObject> {
    
    global Database.QueryLocator start(Database.BatchableContext bc) {
        // Get records modified in last hour
        return Database.getQueryLocator([
            SELECT Id, ExternalId__c, ExternalStatus__c
            FROM Account
            WHERE LastModifiedDate = LAST_N_HOURS:1
        ]);
    }

    global void execute(Database.BatchableContext bc, List<Account> accounts) {
        // Check external system for updates
        List<Account> updates = new List<Account>();
        
        for (Account a : accounts) {
            ExternalStatus status = ExternalServiceClient.getStatus(a.ExternalId__c);
            if (status.value != a.ExternalStatus__c) {
                a.ExternalStatus__c = status.value;
                updates.add(a);
            }
        }
        
        if (!updates.isEmpty()) {
            update updates;
        }
    }

    global void finish(Database.BatchableContext bc) {}
}

// Schedule:
System.schedule('Poll External System', '0 * * * * ?', new PollingBatch());
```

## REST API Integration — Receiving Data

Expose Salesforce as REST API for external systems:

```apex
@RestResource(urlMapping='/api/v1/orders/*')
global class OrderRestResource {
    
    @HttpPost
    global static void createOrder() {
        try {
            String body = RestContext.request.requestBody.toString();
            Map<String, Object> params = (Map<String, Object>) JSON.deserializeUntyped(body);
            
            Order order = new Order();
            order.AccountId = (String) params.get('accountId');
            order.Amount = (Decimal) params.get('amount');
            
            insert order;
            
            Map<String, Object> response = new Map<String, Object>{
                'success' => true,
                'orderId' => order.Id
            };
            
            RestContext.response.statusCode = 201;
            RestContext.response.responseBody = Blob.valueOf(JSON.serialize(response));
            
        } catch (Exception e) {
            RestContext.response.statusCode = 400;
            RestContext.response.responseBody = Blob.valueOf(JSON.serialize(
                new Map<String, Object>{'error' => e.getMessage()}
            ));
        }
    }

    @HttpGet
    global static void getOrder() {
        String orderId = RestContext.request.requestURI.substringAfterLast('/');
        
        Order order = [SELECT Id, Amount, Status FROM Order WHERE Id = :orderId LIMIT 1];
        
        RestContext.response.responseBody = Blob.valueOf(JSON.serialize(order));
    }
}
```

## Timeout Handling

```apex
public class TimeoutService {
    
    public static void handleTimeoutRecovery() {
        // When callout times out, save state for retry
        List<Order> pendingOrders = [
            SELECT Id FROM Order WHERE Sync_Status__c = 'Pending'
        ];
        
        // Queue for retry
        System.enqueueJob(new OrderSyncQueueable(pendingOrders));
    }
}

public class OrderSyncQueueable implements Queueable, Database.AllowsCallouts {
    private List<Order> orders;
    
    public OrderSyncQueueable(List<Order> orders) {
        this.orders = orders;
    }
    
    public void execute(QueueableContext context) {
        try {
            for (Order o : orders) {
                HttpResponse response = ExternalServiceClient.syncOrder(o);
                o.Sync_Status__c = 'Complete';
            }
            update orders;
        } catch (Exception e) {
            // Chain to next job on failure
            if (context.getJobId() != null) {
                System.enqueueJob(new OrderSyncQueueable(orders));
            }
        }
    }
}
```

## Key Takeaway

**Choose integration pattern based on requirements:** HTTP callouts for REST APIs, named credentials for secure storage, Platform Events for async pub/sub, mocking for tests. Always handle errors with retries and timeouts.
