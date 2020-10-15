export {split_hash};

// split_hash - given a hash path like "#!/offerings/COMP1000-S1" 
//   return an object with properties `path` ("offerings") and `id` (COMP1000-S1)
function split_hash(hash) {

    const regex = "#!/([^/]*)/?(.*)?";
    const match = hash.match(regex);
    if (match) {
        return {
            path: match[1],
            id: match[2]
        }
    } else {
        return { path: "" }
    }
}
