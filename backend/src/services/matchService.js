const getMatchById = (id) => {
    console.log(`Getting match with id ${id}`);
    return { id, score: '1-0' };
};

module.exports = {
    getMatchById
};