export {split_hash};

// split_hash - given a hash path like "#!/2020/offerings/COMP1000-S1" 
//   return an object with properties `year` (2020), `path` ("offerings") and `id` (COMP1000-S1)
function split_hash(hash) {

    const regex = "#!/([0-9]+)/([^/]*)/?(.*)?";
    const match = hash.match(regex);
    if (match) {
        return {
            year: match[1],
            path: match[2],
            id: match[3]
        }
    } else {
        return { path: "" }
    }
}
 
