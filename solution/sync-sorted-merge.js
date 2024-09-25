"use strict";

// Print all entries, across all of the sources, in chronological order.
const Heap = require("heap");

module.exports = (logSources, printer) => {
  const minHeap = new Heap((a, b) => a.logEntry.date - b.logEntry.date);

  logSources.forEach((source, index) => {
    const entry = source.pop();
    if (entry) {
      minHeap.push({ logEntry: entry, sourceIndex: index });
    }
  });

  while (!minHeap.empty()) {
    const { logEntry, sourceIndex } = minHeap.pop();

    printer.print(logEntry);

    const nextLog = logSources[sourceIndex].pop();
    if (nextLog) {
      minHeap.push({ logEntry: nextLog, sourceIndex });
    }
  }

  printer.done();

  return console.log("Sync sort complete.");
};
