module.exports = function resolveSeries(series) {
  return series.reduce((seq, fn) => {
    return seq.then(fn)
  }, Promise.resolve())
}
