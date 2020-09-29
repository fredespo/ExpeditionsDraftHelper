# ExpeditionsDraftHelper

Made for the Legends of Runeterra 2019 Developer Challenge host by Riot Games: https://www.riotgames.com/en/DevRel/legends-of-runeterra-developer-challenge-announcement
Project to help players make decisions on what cards to draft during expedition draft.

To compile the project simply download/pull the project.

Run npm install from the directory with package.json
then run "npm start" to start the program


Took into consideration many attributes we thought were important for a card to be useful in the expedition draft. 

We prioritized individual cards as cards that require too much synergy for example a hecarim/ephemeral deck could be very challenging
to complete in a draft so cards like that were lower in value though they are extremely strong in normal mode. 

Overlay is made so it simply will always go on top of the Runeterra game and when the game is closed the overlay will also disappear
shortly after. 

We added many different variation of effects to our automatic calculation, but for many cards the generic values were not enough so we 
hardcoded some cards for now to have a better experience and not have any cards shown as 0 value. But we do plan to make all cards
available to be scored automatically.

Ability importance was scored off of empirical data from playing games, we plan to have a much larger dataset in the future if Riot
were to release this information to have our program make better judgements on what cards are truly useful for the draft mode. 


More detail on the project tech stack -

We wanted a nice desktop app, so we took inspiration from Discord and decided to learn/build the project with electron. Electron 
turned out to be a great choice as we all have background in some basic web development so it made developing the desktop app
much more smoothly than expected.

We used c++ to figure out whether Legends of Runeterra is currently the main window open. 

Currently we are using the set.json from the riot api zip folder to get card data, as I believe in the future the full carddata will be 
available through the lor data dragon rather than from the set. 
We also have a hardcoded list for cards not currently or sufficiently accounted for from the formulas. 
