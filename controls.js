// Initialize Firebase
var config = {
  apiKey: "AIzaSyAWWbSgUegnZ5OR47iwCaj8NmMdnjBjgtg",
  authDomain: "card-tester.firebaseapp.com",
  databaseURL: "https://card-tester.firebaseio.com",
  storageBucket: "card-tester.appspot.com",
  messagingSenderId: "1023196840212"
};
firebase.initializeApp(config);

console.log('Version 1.1 lol')

$("#deck-selection .title").on("click", function() {
  $("#deck-selection ul").toggle();
})

$("#deck-selection li").on("click", function(event) {
  if  (!window.player) return
  var playername = window.player // player_1
  var deckname = $(event.currentTarget).data('deckname')
  window[playername + "_deck"] = window.decks[deckname]
  alert('Selected new deck: ' + deckname);
  console.log('Selected new deck: ', deckname);
})

window.decks = {}


// Pull in deck JSON
$.getJSON('decks/default.json', function(data) {
  window.decks['default'] = data;
  console.log('Player 1 loaded default deck')
  console.log('Player 2 loaded default deck')
  // window.player_1_deck = data;
  // window.player_2_deck = data;
});
$.getJSON('decks/full_tilt_counter.json', function(data) {
  window.decks['full_tilt_counter'] = data
  window.player_2_deck = data;
});

$.getJSON('decks/full_tilt.json', function(data) {
  console.log('Player 1 loaded full_tilt deck')
  window.decks['full_tilt'] = data;
  window.player_1_deck = data;
});

$.getJSON('decks/magic_style.json', function(data) {
  console.log('Player 1 loaded magic_style deck')
  window.decks['magic_style'] = data;
});

window.player = null;

// Player selection
$(".player-select").on("click", function(event) {

  var player = $(event.currentTarget).data("selectplayer");
  window.player = player;

  $(".play-area." + player).addClass("is-you");
  $(".play-area." + player + " button").show();

  // Show new card button for your player
  $('[data-action="new-card"][data-player="' + player + '"]').show();

  $("#play-area").show();
  $("#player-selection").hide();
  $(".card").show();
  // $("#deck-selection").show();
  startGame(); // Start the rest of the listeners
  
});


// Start game
var startGame = function() {

  // Flip cards
  $('body').on('click', '.card', function(event){
    var $card = $(event.currentTarget);
    var card_id = $card.attr('data-id');

    var cardRef = firebase.database().ref('cards/' + card_id);

    cardRef.once('value', function(card_snap){
        cardRef.update({
          facedown: !card_snap.val().facedown
        });
    });

    $(event.currentTarget).toggleClass('is-facedown');
  });

  // Draw new card
  $('[data-action="new-card"]').on('click', function(event) {
    console.log("New card drawn")
    var player = $(event.currentTarget).attr('data-player');
    var playerTop = $('.' + player).css('top');
    drawCard(player);
  });


  var createCard = function(card_id, card_data){
    var $card = $('.card-template').clone();

    $card.addClass('card');
    $card.removeClass('card-template');
    $card.attr('data-id', card_id);
    $card.attr('data-owner', card_data.owner);

    $card.draggable({
      stop: function(e){
        var cardRef = firebase.database().ref('cards/' + card_id);
        cardRef.update({
          top: $card.css('top'),
          left: $card.css('left')
        })
      }
    });
    $card.css({left: card_data.left, top: card_data.top});
    if (card_data.facedown === true){
      $card.addClass('is-facedown');
    }
    $("#card-container").append($card);

    // Give card properties
    $card.find('.card-name').text(card_data["Card Name"])
    $card.find('.card-description').html(card_data["Description"])
    $card.find('.card-mojo').text(card_data["Mojo"])
    $card.find('.card-direction').text(card_data["Direction"])
    $card.find('.card-cost').text(card_data["Cost"])
    $card.find('.card-type').text(card_data["Type"])
    if (card_data["Type"] == "Ooze") {
      $card.find('.card-front').addClass('is-ooze')
    }
    if (card_data["Type"] == "Augmentation") {
      $card.find('.card-front').addClass('is-augmentation')
    }

    if (window.player)
      $card.show();
  };

  // Listens for new cards joining the fray
  var globalCardListener = function() {
    var allCardsRef = firebase.database().ref('/cards');

    // When cards are changed
    allCardsRef.on('value', function(new_cards) {
      $('.card').remove(); // Remove all cards

      // Recreate every card @ their new location
      
      if (!new_cards.val()) return; // (Don't bother if no cards are present)
      Object.keys(new_cards.val()).forEach(function(card_id){
        createCard(card_id, new_cards.val()[card_id]);
      })
    });
  };
  globalCardListener();


  var messageListener = function(){
    var messageRef = firebase.database().ref('/message');
    messageRef.on('value', function(message_snap) {
      postMessage(message_snap.val().message);
    });
  };
  messageListener();



  // Global game actions (like reset)
  $("#reset-game").on("click", function() {
    var confirm = window.confirm("Are you sure you want to reset?");
    if (confirm) {
      resetGame();
    }
  })

  console.log('Controls loaded...');
}