const get = (key) => {
    console.log(`Getting ${key} from cache`);
    return null;
};

const set = (key, value) => {
    console.log(`Setting ${key} in cache`);
};

module.exports = {
    get,
    set
};