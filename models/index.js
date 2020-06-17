const mongoose = require("mongoose");
const q = require('q');

class promiseBasedQueries extends mongoose.Model{
    static _find({ query, sort = false, limit = false, skip = 0, }) {
        let promise = q.defer();
        if (!query) {
            promise.reject("No query params");
            return promise.promise;
        }
        let queryParams = {
            $and: [
                query
            ]
        };
        this.find(queryParams)
            .sort(sort)
            .limit(limit)
            .skip(skip)
            .exec((error, documents) => {
            if (error) {
                promise.reject(error);
                return promise.promise;
            }
            promise.resolve(documents);
        });
        return promise.promise;
    }

    static _findOne({ query, sort = false, limit = false, skip = 0, }) {
        let promise = q.defer();
        if (!query) {
            promise.reject("No query params");
            return promise.promise;
        }
        let queryParams = {
            $and: [
                query
            ]
        };
        this.findOne(queryParams)
            .sort(sort)
            .limit(limit)
            .skip(skip)
            .exec((error, documents) => {
            if (error) {
                promise.reject(error);
                return promise.promise;
            }
            promise.resolve(documents);
        });
        return promise.promise;
    }

    _save(){
        let promise = q.defer();
        this.save((err, newDoc) => {
            if (err) {
                promise.reject(err);
                return promise.promise;
            }
            promise.resolve(newDoc);
        });
        return promise.promise;
    }
}

module.exports = promiseBasedQueries