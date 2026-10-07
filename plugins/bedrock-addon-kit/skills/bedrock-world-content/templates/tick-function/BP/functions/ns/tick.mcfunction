# Runs 20 times a second for every pack that lists it. Keep it cheap: filter with selectors, do the work in other functions.
execute as @a[tag=!ns_init] at @s run function ns/setup
