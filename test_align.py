from Bio import Align
aligner = Align.PairwiseAligner()
a = aligner.align("ATGC", "ATTC")[0]
print("Type of a:", type(a))
print("a[0]:", a[0])
print("a[1]:", a[1])
