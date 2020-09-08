with open("medium_puzzles.txt", "r") as f:
    lines = f.readlines()
with open("medium_puzzles.txt", "w") as f:
    idx = 0
    num_count = 0
    low_limit = 30
    high_limit = 36
    for line in lines:
        if (idx % 2 == 0):
            num_count = 0
            for char in line:
                if (char != '-'):
                    num_count += 1
        if (num_count >= low_limit and num_count <= high_limit):
            f.write(line)
        idx += 1

