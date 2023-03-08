export default (generatorMaker) => {
    const generator = generatorMaker()
    return () => {
        const handle = (result) => {
            if (result.done) {
                return result.value
            } else {
                result.value.then(value => {
                    handle(generator.next(value))
                })
            }
        }

        try {
            return handle(generator.next())
        } catch (error) {
            return Promise.reject(error)
        }
    }
}