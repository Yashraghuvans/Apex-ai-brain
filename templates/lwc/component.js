import { LightningElement, wire, track, api } from 'lwc';

/**
 * {{componentName}}
 * 
 * ENFORCE: NO business logic in LWC components
 * Component responsibilities:
 * - Display UI state based on @track properties
 * - Handle user interactions (clicks, input changes)
 * - Call Apex methods via @wire or imperative calls
 * - Dispatch CustomEvents for parent communication
 * - Handle errors gracefully with messages
 * 
 * @component {{componentName}}
 * @permission Lightning App / Record Page
 */
export default class {{componentName}} extends LightningElement {

    /**
     * @api property - can be set by parent component
     * Optional input for filtering or configuration
     */
    @api recordId;
    @api objectApiName;

    /**
     * @track properties - trigger reactivity when changed
     */
    @track isLoading = false;
    @track hasError = false;
    @track errorMessage = '';
    @track isEmpty = false;
    @track items = [];
    @track title = 'Component Title';
    @track description = 'Component Description';

    /**
     * Lifecycle hook: Component initialized
     * Runs ONCE when component is created
     * Use for: initial setup, event listeners
     */
    connectedCallback() {
        console.log('{{componentName}} initialized');
        // Initialize component state
        // Example: this.loadData();
    }

    /**
     * Lifecycle hook: Component removed from DOM
     * Clean up resources, remove listeners
     */
    disconnectedCallback() {
        console.log('{{componentName}} destroyed');
        // Remove event listeners
        // Clean up resources
    }

    /**
     * Wire adapter pattern: Call Apex method
     * Automatically calls method whenever inputs change
     * Pattern: @wire(ApexMethod, { param: this.value })
     * wire result contains data and error
     */
    // @wire(getApexMethod, { recordId: '$recordId' })
    // wiredData({ error, data }) {
    //     if (data) {
    //         this.items = data;
    //         this.isEmpty = data.length === 0;
    //         this.hasError = false;
    //     } else if (error) {
    //         this.handleError(error);
    //     }
    // }

    /**
     * Imperative Apex call: Load data on demand
     * Use when you need control over when to call Apex
     * Pattern: Invoke on user action (button click, etc)
     */
    async loadData() {
        this.isLoading = true;
        this.hasError = false;

        try {
            // Example: Call Apex method imperatively
            // const result = await getApexMethod({
            //     recordId: this.recordId,
            //     filters: this.filters
            // });
            // if (result) {
            //     this.items = result;
            //     this.isEmpty = result.length === 0;
            // }
        } catch (error) {
            this.handleError(error);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Event handler: Submit form
     * Called when user clicks Submit button
     */
    handleSubmit() {
        console.log('Submit clicked');
        
        // Validate input
        if (this.validateForm()) {
            // Prepare data
            const dataToSend = this.prepareData();
            
            // Dispatch custom event to parent
            this.dispatchEvent(
                new CustomEvent('submit', {
                    detail: dataToSend,
                    bubbles: true,
                    composed: true
                })
            );

            // Optional: Call Apex to persist
            // this.saveData(dataToSend);
        }
    }

    /**
     * Event handler: Cancel operation
     * Called when user clicks Cancel button
     */
    handleCancel() {
        console.log('Cancel clicked');
        
        // Reset form state
        this.items = [];
        this.isEmpty = true;
        
        // Dispatch cancellation event
        this.dispatchEvent(
            new CustomEvent('cancel', {
                bubbles: true,
                composed: true
            })
        );
    }

    /**
     * Error handling: Centralized error management
     * Called when Apex returns error or exception
     */
    handleError(error) {
        console.error('Error:', error);
        this.hasError = true;
        
        // Extract error message from various error formats
        if (typeof error === 'string') {
            this.errorMessage = error;
        } else if (error && error.body && typeof error.body.message === 'string') {
            this.errorMessage = error.body.message;
        } else if (error && error.message) {
            this.errorMessage = error.message;
        } else {
            this.errorMessage = 'An unexpected error occurred';
        }

        console.error('Error message:', this.errorMessage);
    }

    /**
     * Clear error state
     * Called when user closes error message
     */
    clearError() {
        this.hasError = false;
        this.errorMessage = '';
    }

    /**
     * Form validation: Check required fields
     * Returns true if valid, false otherwise
     */
    validateForm() {
        // Add validation logic here
        // Example: Check if required fields are filled
        if (!this.items || this.items.length === 0) {
            this.handleError('Please add at least one item');
            return false;
        }
        return true;
    }

    /**
     * Prepare data for submission
     * Transforms component data into format expected by Apex
     */
    prepareData() {
        return {
            recordId: this.recordId,
            items: this.items,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Getter: Determine if loading spinner should show
     */
    get isLoadingSpinnerVisible() {
        return this.isLoading;
    }

    /**
     * Getter: Determine if error message should show
     */
    get isErrorVisible() {
        return this.hasError && !this.isLoading;
    }

    /**
     * Getter: Determine if empty state should show
     */
    get isEmptyStateVisible() {
        return this.isEmpty && !this.isLoading;
    }
}
