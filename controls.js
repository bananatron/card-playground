// Initialize Firebase
var config = {
  apiKey: "AIzaSyAWWbSgUegnZ5OR47iwCaj8NmMdnjBjgtg",
  authDomain: "card-tester.firebaseapp.com",
  databaseURL: "https://card-tester.firebaseio.com",
  storageBucket: "card-tester.appspot.com",
  messagingSenderId: "1023196840212"
};
firebase.initializeApp(config);

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
      console.log(card_snap.val());
        cardRef.update({
          facedown: !card_snap.val().facedown
        });
    });

    $(event.currentTarget).toggleClass('is-facedown');
  });

  // Draw new card
  $('[data-action="new-card"]').on('click', function(event) {
    console.log("new card drawn")
    var player = $(event.currentTarget).attr('data-player');
    var playerTop = $('.' + player).css('top');
    uploadMessage(player + ' drew a card. ' + Math.floor(Math.random()*20));

    // TODO pull from player deck
    if (player === 'player_1'){
      var cardsRef = firebase.database().ref('cards').push({
        owner:'player_1',
        left: 0,
        top: 0,
        facedown: false
      });
    } else {
      var cardsRef = firebase.database().ref('cards').push({
        owner:'player_2',
        left: 0,
        top: playerTop,
        facedown: false
      });
    }
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
      if (!new_cards) return; // (Don't bother if no cards are present)
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