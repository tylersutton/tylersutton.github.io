with open("hard_puzzles.txt", "r") as f:
    lines = f.readlines()
    idx = 0
    threshold = 30
    over = 0
    under = 0
    for line in lines:
        if (idx % 2 == 0):
            tally = 0
            for char in line:
                if (char != '-'):
                    tally += 1
            if (tally > threshold):
                over += 1
            else:
                under += 1
        idx += 1

    print("over " + str(threshold) + ": " + str(over))
    print("under " + str(threshold) + ": " + str(under))
