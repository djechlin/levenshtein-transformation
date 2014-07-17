levenshtein-transformation
==========================

Transform one string into another using the operations in the Levenshtein edit distance computation.

Uses the Wagner-Fisher algorithm, which is the really common dynamic programming approach. Runs in O(m*n) and uses O(m*n) memory. Outputs the set of Levenshtein operations to transform one string into another.

Includes a method to apply a sequence of Levenshtein operations to one string to transform it to the other.
(Todo?) Optionally can output the intermediate sequence.

