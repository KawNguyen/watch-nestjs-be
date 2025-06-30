export function buildUpsertData(addresses: any) {
  return Array.isArray(addresses)
    ? addresses.map((address: any) => ({
        where: { id: address.id || '' },
        update: { ...address },
        create: { ...address },
      }))
    : [
        {
          where: { id: addresses.id || '' },
          update: { ...addresses },
          create: { ...addresses },
        },
      ];
}
