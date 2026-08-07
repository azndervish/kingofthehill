export default function(className) {
    return {
        info: function(message) {
            console.log(`${new Date().toISOString()} INFO [${className}]: ${message}`)
        },
        debug: function(message) {
            console.log(`${new Date().toISOString()} DEBUG [${className}]: ${message}`)
        },
        error: function(message) {
            console.log(`${new Date().toISOString()} ERROR [${className}]: ${message}`)
        }
    }
}
