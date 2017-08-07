var pintext = {};

var hash = "sadfjaksjfakls/as/fdsa/fd/saf";

if (hash.indexOf('/') === -1) {
    pintext.hash = hash;
} else {
    hash = hash.split('/').join('#');
    pintext.hash = hash;
}

console.log(pintext.hash);