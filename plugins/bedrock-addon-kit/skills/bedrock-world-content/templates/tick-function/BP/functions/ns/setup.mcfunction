scoreboard objectives add ns_coins dummy Coins
scoreboard players add @s ns_coins 0
tellraw @s {"rawtext":[{"translate":"ns.welcome"}]}
playsound ns.ui.chime @s
tag @s add ns_init
