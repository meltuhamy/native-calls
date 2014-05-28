# Benchmark Results

We used the IDL file below to test transfer and processing performance:

```idl
dictionary dict {
  DOMString str;
  double d;
  boolean b;
};

dictionary nestedDict {
  DOMString topStr;
  double topD;
  boolean topB;
  dict nested;
};

interface Benchmark{
  long bench_long(long v);
  double bench_double(double v);
  DOMString bench_DOMString(DOMString v);
  dict bench_dict(dict v);
  nestedDict bench_nestedDict(nestedDict v);

  sequence<long> bench_seq_long(sequence<long> v);
  sequence<double> bench_seq_double(sequence<double> v);
  sequence<DOMString> bench_seq_DOMString(sequence<DOMString> v);
  sequence<dict> bench_seq_dict(sequence<dict> v);
  sequence<nestedDict> bench_seq_nestedDict(sequence<nestedDict> v);

  boolean printSeperator(DOMString tag);
};
```

## Round trip performance
Measure the number of round trips performed in 1 second (RT/s).

1 round trip corresponds to a full remote procedure call, starting from JavaScript, reaching the target function, returning from the function, and going back to the JavaScript.

These results were calculated using benchmarkjs.


### Single variable (1 non-array paramater)

| Type               | Mean RT/s | Uncertainty| Number of runs |
|--------------------|-----------|------------|----------------|
| long               | 418       | ±1.79%     | 56             |
| double             | 423       | ±2.08%     | 48             |
| DOMString          | 420       | ±1.25%     | 43             |
| dict               | 415       | ±2.39%     | 44             |
| nestedDict         | 385       | ±1.29%     | 47             |

### Arrays of variable length

| Array length | long RT/s     | double RT/s  | DOMString RT/s | dict RT/s    | nestedDict RT/s |
|--------------|---------------|--------------|----------------|--------------|-----------------|
| 10           | 403 ±2.20%    | 403 ±2.19%   | 378 ±1.48%     | 317 ±1.76%   | 244 ±1.81%      |
| 45           | 379 ±1.99%    | 384 ±2.01%   | 309 ±1.22%     | 182 ±3.03%   | 112 ±1.15%      |
| 100          | 354 ±2.01%    | 347 ±1.62%   | 234 ±2.59%     | 110 ±1.36%   | 60.07 ±1.24%    |
| 450          | 237 ±1.18%    | 235 ±2.07%   | 102 ±1.48%     | 32.82 ±1.10% | 15.83 ±0.96%    |
| 1000         | 163 ±1.54%    | 160 ±1.04%   | 55.41 ±1.89%   | 15.39 ±1.06% | 7.43 ±1.29%     |
| 4500         | 49.39 ±1.67%  | 48.93 ±1.41% | 14.60 ±0.75%   | 3.62 ±1.26%  | 1.68 ±1.05%     |
| 10000        | 24.68 ±0.90%  | 24.50 ±1.00% | 6.62 ±1.85%    | 1.62 ±1.68%  | 0.75 ±1.81%     |
| 45000        | 5.99 ±1.37%   | 5.98 ±0.92%  | 1.28 ±2.92%    | 0.33 ±2.48%  | 0.15 ±2.46%     |


## C++ Library Time
Measure the number of microseconds taken to handle a RPC call.
This is the time it takes to detect it is an RPC call, extract paramaters, convert them, find the method, call it, pack the result, and post the message back to JS.

The results are measured and averaged for the same runs that were performed above.

### Single variable (1 non-array paramater)

| Type               | Mean lib time/μs  | Uncertainty (1 sd)|
|--------------------|-------------------|-------------------|
| long               | 105.50            | 17.88             |
| double             | 104.12            | 17.34             |
| DOMString          | 103.98            | 17.55             |
| dict               | 136.15            | 23.35             |
| nestedDict         | 179.71            | 28.32             |

### Arrays of variable length and types
The table below shows the average time, in microseconds, it takes to process an array of variable lengths and types.

| Array length | long type | double type | DOMSTring type | dict type | nestedDict type |
|--------------|-----------|-------------|----------------|-----------|-----------------|
| 10           | 125.40    | 125.91      | 197.42         | 453.41    | 861.02          |
| 45           | 168.64    | 163.34      | 484.03         | 1512.79   | 3272.52         |
| 100          | 242.70    | 245.74      | 906.05         | 3445.17   | 7009.90         |
| 450          | 705.10    | 703.79      | 3734.62        | 13628.62  | 28198.18        |
| 1000         | 1275.59   | 1354.86     | 7606.78        | 29582.43  | 63493.50        |
| 4500         | 5547.10   | 5564.47     | 30485.21       | 132121.82 | 292827.69       |
| 10000        | 11282.88  | 11376.26    | 68443.89       | 301437.50 | 632956.25       |
| 45000        | 50532.42  | 50843.33    | 359133.64      | 1418791.67| 3242286.00      |
| 100000       | 104087.22 | 114020.00   | 799742.86      | 3319250.00| 7347985.00      |


## JS Library performance
The JS library performance **without** validation has also been measured, however its performance impact is negligible.
The slowest benchmark was found to take approx 3 microseconds (269,253 ops/sec ±1.90%).

## Analysis
From the data, we can see that for small types, the most contributing factor to performance is the browser (e.g. event system, etc.) and PPAPI libraries (how PPAPI implements postMessage).
For example, sending a single long type takes 2392.34 microseconds (.002 seconds), but our library only spends 105.5 microseconds processing the call (less than 5% of the time).


For large and complicated data, the impact of using the library becomes higher and higher.
For example, sending 45000 nested objects (which are actually quite simple) has a total round-trip time of 6.67s, and a whole 3.24 seconds of this is spent in our library (i.e. half the time).


More analysis, graphs and reasoning soon :)