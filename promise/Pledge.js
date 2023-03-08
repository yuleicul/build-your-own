export default class Pledge {
    state = 'pending'
    value
    reason
    fulfillHandlers = []
    rejectHandlers = []

    constructor(executor) {
        executor(this.resolve.bind(this), this.reject.bind(this))
    }

    resolve(value) {
        this.state = 'fulfilled'
        this.value = value
        this.fulfillHandlers.forEach(fulfillHandler => fulfillHandler(value))
    }

    reject(reason) {
        this.state = 'rejected'
        this.reason = reason
        this.rejectHandlers.forEach(rejectHandler => rejectHandler(reason))
    }

    then(onfulfilled, onrejected) {
        return new Pledge((resolve, reject) => {
            const fulfillHandler = (value) => {
                const lastHandlerResult = onfulfilled(value)
                if (lastHandlerResult instanceof Promise || lastHandlerResult instanceof Pledge) {
                    lastHandlerResult.then(resolve)
                } else {
                    resolve(lastHandlerResult)
                }
            }

            const rejectHandler = (reason) => {
                const lastHandlerResult = onrejected(reason)
                reject(lastHandlerResult)
            }

            this.fulfillHandlers.push(fulfillHandler)
            this.rejectHandlers.push(rejectHandler)
        })
    }

    static resolve(value) {
        return new Pledge((resolve) => resolve(value))
    }

    static reject(reason) {
        return new Promise((_, reject) => reject(reason))
    }
}
