"use strict";

// Print all entries, across all of the *async* sources, in chronological order.

const Heap = require("heap");

module.exports = async (logSources, printer) => {
  const minHeap = new Heap((a, b) => a.logEntry.date - b.logEntry.date);

  const initializeHeap = async () => {
    const initialPromises = logSources.map(async (source, sourceIndex) => {
      try {
        const entry = await source.popAsync();
        if (entry) {
          minHeap.push({ logEntry: entry, sourceIndex });
        }
      } catch (error) {
        console.error(
          `Error fetching initial entry from LogSource ${sourceIndex}:`,
          error
        );
      }
    });

    await Promise.all(initialPromises);
  };

  await initializeHeap();

  while (!minHeap.empty()) {
    const { logEntry, sourceIndex } = minHeap.pop();

    printer.print(logEntry);

    try {
      const nextLog = await logSources[sourceIndex].popAsync();
      if (nextLog) {
        minHeap.push({ logEntry: nextLog, sourceIndex });
      }
    } catch (error) {
      console.error(
        `Error fetching next entry from LogSource ${sourceIndex}:`,
        error
      );
    }
  }

  printer.done();
};
