function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

var drawCard = function(player) {

    var allCardsRef = firebase.database().ref('/cards');
    var deckRef = firebase.database().ref('/decks/' + player);
    deckRef.once('value').then(function(snapshot) {
        var deck = snapshot.val();
        var firstCardKey = Object.keys(deck)[0];
        var firstCard = deck[firstCardKey];
        firstCard.owner = player;
        firstCard.left = 0;
        firstCard.facedown = false;

        // Card positioning
        var playerTop = $('.' + player).css('top');
        firstCard.top = playerTop;

        allCardsRef.push(firstCard); // Add to hand
        firebase.database().ref('/decks/' + player).child(firstCardKey).remove(); // Remove from deck

        var cardCountRemaining = Object.keys(deck).length
        uploadMessage(player + ' drew a card. ' + cardCountRemaining);
    });
}

var resetGame = function() {
    uploadMessage(window.player + " reset game!");
    var allCardsRef = firebase.database().ref('/cards');
    var deckRef = firebase.database().ref('/decks');
    deckRef.remove();
    allCardsRef.remove();
    buildDeck('player_1');
    buildDeck('player_2');
}

var buildDeck = function(player) {
    var deckRef = firebase.database().ref('/decks/' + player);
    var shuffledDeck = shuffle(window[player + '_deck']);
    shuffledDeck.forEach(function(card) {
        deckRef.push(card);
    })
}

var postMessage = function(message){
    var $modal = $('.message-modal');
    $modal.text(message);
    $modal.removeClass('is-hidden');
    setTimeout(function(){
        $modal.addClass('is-hidden');
    }, 1600)
};

var uploadMessage = function(msg) {
    var messageRef = firebase.database().ref('/message');
    messageRef.set({
        message: msg
    })
};



