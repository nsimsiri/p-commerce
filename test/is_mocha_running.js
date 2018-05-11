exports.is_mocha_running = () => {
    return typeof(global.it) === 'function';
}
