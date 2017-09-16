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
        if (!deck) { // if deck is empty
            alert(player + " has no more cards in their library.")
            return;
        }
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
    firebase.database().ref('/cards').remove();
    firebase.database().ref('/decks').remove();
    buildDeck('player_1');
    buildDeck('player_2');
    //buildDungeonDeck();
}

var getCardListFromAirtable = function() {
    // Puts all the cards w/ their airtable IDs in firebase so that decklists can pull from them
    // decklists are simply a list of IDs (from the deck airtable tab thing)
    $.ajax({
        url: "https://api.airtable.com/v0/appzXeslgG8oxXqRL/Card%20List",
        headers: {"Authorization": "Bearer keyhdUvEUU5IL7Aqs"}
    }).done(function(data) {
        console.log('Got airtable card data - storing locally...')

        data.records.forEach(function(card_data) {
            window.card_list[card_data.id] = card_data.fields
        });
        setTimeout(function() {
            getDeckListsFromAirtable()
        }, 1000)

    }).fail(function(data){
        console.log('‼️ Failure connecting to airtable for cardlist', data)
    });
}

window.getDeckListsFromAirtable = function() {
    // Get deck lists which are just a list of IDs

    var deckListDom = $("#deck-selection").find("ul")
    $.ajax({
        url: "https://api.airtable.com/v0/appzXeslgG8oxXqRL/Decks",
        headers: {"Authorization": "Bearer keyhdUvEUU5IL7Aqs"}
    }).done(function(data) {
        console.log('Got airtable deck data - storing locally...')

        var airtableDecks = data.records;
        airtableDecks.forEach(function(deck_data) {
            if (deck_data.fields['Card List']) { // If decklist has cards in it
                // window.decks[deck_data.fields.Name] = {'Card List': deck_data.fields['Card List']}
                window.decks[deck_data.fields.Name] = []
                // Go through each card and find definition from global window.card_list
                deck_data.fields['Card List'].forEach(function(card_id) {
                    window.decks[deck_data.fields.Name].push(window.card_list[card_id])
                })
                if (deck_data.fields['Other Cards']) {
                    deck_data.fields['Other Cards'].forEach(function(card_id) {
                        window.decks[deck_data.fields.Name].push(window.card_list[card_id])
                    })
                }
                if (deck_data.fields['More Cards']) {
                    deck_data.fields['More Cards'].forEach(function(card_id) {
                        window.decks[deck_data.fields.Name].push(window.card_list[card_id])
                    })
                }
                deckListDom.append('<li data-deckname="'+ deck_data.fields.Name +'">' + deck_data.fields.Name + '</li>')
            }
        });
        setTimeout(function() {
            console.log("Revealing deck chooser");

            // Set handlers
            $("#deck-selection li").on("click", function(event) {
                if  (!window.player) return
                var playername = window.player // player_1
                var playerRef = firebase.database().ref('/players/' + playername);
                var deckname = $(event.currentTarget).data('deckname');
                playerRef.set({deck: deckname}).then(function() {
                    alert("Deck selected: " + deckname)
                })
            })
            $("#deck-selection").show()
        }, 1000)
        
    }).fail(function(data){
        console.log('‼️ Failure connecting to airtable for decklist', data)
    });
}

var buildDeck = function(player) {
    console.log('Building deck for ', player)

    firebase.database().ref('/players').child(window.player).once("value", function(snap){
        var deckname = snap.val().deck;
        var deckRef = firebase.database().ref('/decks/' + player);
        var shuffledDeck = shuffle(window.decks[deckname]);
        
        shuffledDeck.forEach(function(card) {
            deckRef.push(card);
        })
    });
}

var buildDungeonDeck = function() {
    var deckRef = firebase.database().ref('/decks/dungeon');
    var shuffledDeck = shuffle(window.dungeon_deck);
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



