var aggObject = {
    "size": 0,
    "aggs": {
        "museum": {
            "terms": {
                "field": "museumsid",
                "order": {
                    "_term": "asc"
                },
                "size": 1000
            },
            "aggs": {
                "fag": {
                    "terms": {
                        "field": "fagmiljøer",
                        "order": {
                            "_term": "asc"
                        },
                        "size": 1000
                    }
                }
            }
        },
        "keywords": {
            "terms": {
                "field": "gjenstandstyper",
                "order": {
                    "_term": "asc"
                },
                "size": 1000
            }
        }
    }
};
var wordListQuery = {
    "tags": {
        "terms": {
            "field": "textcontainer",
            "include": "",
            "order": { "_term": "asc" }
        }
    }
};
var sortPhoto = [
    { "hasPhoto": "desc" },
    { "gjenstandid": "desc" }
];
