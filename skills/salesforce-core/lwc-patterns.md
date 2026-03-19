# LWC Patterns — Modern Component Development

## Overview

Lightning Web Components (LWC) are modern, production-grade web components for Salesforce. Key principle: **UI logic only, no business logic in components.**

## Lifecycle Hooks

### connectedCallback
Runs **once** when component is added to DOM.

```javascript
connectedCallback() {
    // Initialize state
    this.isLoading = true;
    
    // Fetch data on load
    this.loadData();
    
    // Add event listeners
    window.addEventListener('scroll', this.handleScroll);
}
```

### disconnectedCallback
Runs when component is removed from DOM — clean up resources.

```javascript
disconnectedCallback() {
    // Remove listeners (prevent memory leaks)
    window.removeEventListener('scroll', this.handleScroll);
    
    // Cancel pending requests
    this.abortController?.abort();
    
    // Clean up timers
    clearTimeout(this.timeoutId);
}
```

### renderedCallback
Runs **after** every render (including reactivity updates).

```javascript
renderedCallback() {
    // Manipulate DOM after render
    const button = this.template.querySelector('button');
    if (button) {
        button.focus();
    }
}
```

## Wire Adapters — Reactive Data Binding

Wire adapters automatically call Apex methods when inputs change.

### @wire with Dependency

```javascript
import getAccount from '@salesforce/apex/AccountController.getAccount';

@track recordId = '001xx000003DHP1';

@wire(getAccount, { accountId: '$recordId' })
wiredAccount({ error, data }) {
    if (data) {
        this.account = data;
        this.error = undefined;
    } else if (error) {
        this.error = error;
        this.account = undefined;
    }
}
```

When `recordId` changes → Apex method is called automatically → `wiredAccount` is invoked → component re-renders.

### @wire with Filter

```javascript
@wire(getAccounts, { searchTerm: '$filterTerm' })
wiredAccounts({ error, data }) {
    if (data) {
        this.accounts = data;
    }
}
```

### Imperative Call (On Demand)

```javascript
import getAccountDetails from '@salesforce/apex/AccountController.getAccountDetails';

async loadDetails() {
    try {
        this.isLoading = true;
        const result = await getAccountDetails({ recordId: this.recordId });
        this.accountDetails = result;
    } catch (error) {
        this.handleError(error);
    } finally {
        this.isLoading = false;
    }
}
```

## @api Properties — Parent to Child Communication

### Parent Component

```javascript
export default class ParentComponent extends LightningElement {
    @track selectedRecord;

    handleSelectRecord(event) {
        this.selectedRecord = event.detail;
    }
}
```

```html
<!-- Parent template -->
<c-child-component record-id={selectedRecord.id}></c-child-component>
```

### Child Component

```javascript
export default class ChildComponent extends LightningElement {
    @api recordId;

    connectedCallback() {
        if (this.recordId) {
            this.loadRecord();
        }
    }

    @api getSelectedItems() {
        // Parent can call this method
        return this.selectedItems;
    }
}
```

When parent sets `recordId` → child's wire automatically fires → child re-renders.

## Child to Parent Communication — CustomEvent

### Child Component (Dispatches Event)

```javascript
handleSelectItem(itemId) {
    // Dispatch custom event to parent
    this.dispatchEvent(
        new CustomEvent('itemselected', {
            detail: { itemId: itemId, timestamp: new Date() },
            bubbles: true,      // Bubble up DOM
            composed: true      // Cross shadow DOM boundary
        })
    );
}
```

### Parent Component (Listens to Event)

```html
<c-child-component onitemselected={handleChildSelection}></c-child-component>
```

```javascript
handleChildSelection(event) {
    const selectedItemId = event.detail.itemId;
    console.log('Child selected item:', selectedItemId);
}
```

## Lightning Message Service — Sibling Communication

For unrelated components to communicate through a channel.

### Define Channel (shared file)

```javascript
// messageChannels/sampleMessageChannel.js
import { MessageChannel } from 'lightning/messageService';

export const SAMPLE_MESSAGE_CHANNEL = new MessageChannel();
```

### Subscriber (Component A)

```javascript
import { MessageChannel } from 'lightning/messageService';
import { subscribe, unsubscribe } from 'lightning/messageService';
import { SAMPLE_MESSAGE_CHANNEL } from 'c/messageChannels/sampleMessageChannel';

export default class SubscriberComponent extends LightningElement {
    subscription;

    connectedCallback() {
        this.subscription = subscribe(
            null,
            SAMPLE_MESSAGE_CHANNEL,
            (message) => this.handleMessage(message)
        );
    }

    handleMessage(message) {
        console.log('Received:', message.detail);
    }

    disconnectedCallback() {
        unsubscribe(this.subscription);
    }
}
```

### Publisher (Component B)

```javascript
import { publish, MessageContext } from 'lightning/messageService';
import { SAMPLE_MESSAGE_CHANNEL } from 'c/messageChannels/sampleMessageChannel';

export default class PublisherComponent extends LightningElement {
    @wire(MessageContext)
    messageContext;

    handlePublish() {
        publish(this.messageContext, SAMPLE_MESSAGE_CHANNEL, {
            lmsdata: {
                recordId: this.recordId,
                action: 'REFRESH'
            }
        });
    }
}
```

## Error Handling Patterns

### Try/Catch with User Feedback

```javascript
async loadData() {
    try {
        this.isLoading = true;
        this.errorMessage = null;
        
        const result = await getDataFromApex({ id: this.recordId });
        this.data = result;
        
    } catch (error) {
        this.handleError(error);
    } finally {
        this.isLoading = false;
    }
}

handleError(error) {
    console.error('Error:', error);
    
    // Extract meaningful error message
    if (error.body && error.body.message) {
        this.errorMessage = error.body.message;
    } else if (typeof error === 'string') {
        this.errorMessage = error;
    } else {
        this.errorMessage = 'An unexpected error occurred';
    }
    
    // Show error to user
    this.showErrorNotification();
}
```

### Wire Error Handling

```javascript
@wire(getAccount, { recordId: '$recordId' })
wiredAccount({ error, data }) {
    if (data) {
        this.account = data;
        this.error = null;
    } else if (error) {
        this.error = this.extractError(error);
    }
}

extractError(error) {
    return error?.body?.message || 'Could not load account';
}
```

## Performance Patterns

### Lazy Load Data

```javascript
@track dataLoaded = false;

connectedCallback() {
    // Don't load data immediately
    // Wait for user action
}

handleExpandSection() {
    if (!this.dataLoaded) {
        this.loadData();
        this.dataLoaded = true;
    }
}
```

### Debounce Search Input

```javascript
search(event) {
    const searchTerm = event.detail.value;
    
    // Cancel previous timeout
    clearTimeout(this.searchTimeout);
    
    // Wait 300ms before searching
    this.searchTimeout = setTimeout(() => {
        this.doSearch(searchTerm);
    }, 300);
}
```

### List Rendering Optimization

```html
<!-- ❌ BAD: Re-renders entire list for one change -->
<template for:each={items} for:item="item">
    <c-item-card key={item.id} item={item}></c-item-card>
</template>

<!-- ✅ GOOD: Only changed item re-renders -->
<template for:each={items} for:item="item" for:index="index">
    <c-item-card 
        key={item.id} 
        item={item}
        index={index}
        ondelete={handleDelete}>
    </c-item-card>
</template>
```

## Component Communication Summary

| Scenario | Method | Direction |
|----------|--------|-----------|
| Parent → Child | `@api` properties | One way |
| Child → Parent | `CustomEvent` | One way |
| Siblings | Lightning Message Service | Both ways |
| Lifecycle | `connectedCallback`, `renderedCallback` | Hooks |
| Data Binding | `@wire`, `@track` | Reactive |

## Best Practices

1. **Keep logic in Apex** — LWC displays data only
2. **Use `@wire` first** — automatic reactivity
3. **Handle errors** — always show user feedback
4. **Clean up in `disconnectedCallback`** — prevent memory leaks
5. **Use `inherited sharing`** in Apex methods
6. **Test edge cases** — empty states, errors, loading
7. **Lazy load** — don't fetch data until needed

## Key Takeaway

**LWC components are view-only** — all business logic lives in Apex. Use `@wire` for reactive data binding, `CustomEvent` for child-to-parent communication, and Lightning Message Service for sibling communication. Keep components simple and testable.
