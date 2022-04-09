export const enum network {
  ASTAR = 'astar',
  SHIDEN = 'shiden',
}

export const chainId = (nw: network) => {
  if (nw === network.ASTAR) {
    return 592
  }
  return 336
}

export const appName = 'kagla-api'
