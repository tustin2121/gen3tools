# EmScript Debugger

This is a program that allows the user to view the state of the Pokemon Emerald Scripting language as it runs in the emulator. This debugger requires the [BizHawk fork created by TwitchPlaysPokemon]() that has an http API in order to read the state of the emualtor.

To run:
```console
npm install
npm start
```

# Emerald Scripting Explaination

Pokemon Emerald (and gen 3 in general) makes use of a scripting engine as well as native code.

There are two native "Callbacks" which are used as the main methods which run the game. These callbacks are run once per frame as part of the main game loop. These callbacks change all the time given different contexts. For example, there are callbacks for walking around in the overworld, and different callbacks for various stages of battle. In the debugger, these callbacks, as well as a saved callback, are displayed along the top.

There are two Scripting Contexts used by the game as well. Context 1 can be in 3 states, "stopped", "running", and "standby". Context 2 can be either "enabled" or "disabled". The following behaviors have been observed: 
* In the overworld, Context 1 is usually in a standby or uninitiated state as the player walks around the world. Context 2 is usually disabled. 
* Context 2 is used to run map scripts when the player enters a new map.
* When the player interacts with an event, Context 1 runs the event script. Context 2 is enabled but usually isn't running anything.
* When in a battle, Context 1 is in a stopped state. Context 2 is enabled. Despite being enabled, however, Context 2 is not used for battle scripting, as battle scripting is a completely sepatate entity and uses entirely different mechanics.
