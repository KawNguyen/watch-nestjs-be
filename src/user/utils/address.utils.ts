import { AddressDto } from '../dto/user.dto';
import { BadRequestException } from '@nestjs/common';

export function serializeAddress(address: AddressDto) {
  return `${address.street}|${address.ward}|${address.district}|${address.city}|${address.country}`
    .toLowerCase()
    .trim();
}

export function checkDuplicateAddresses(addresses: AddressDto[]) {
  const seen = new Set<string>();
  for (const addr of addresses) {
    const key = serializeAddress(addr);
    if (seen.has(key)) {
      throw new BadRequestException('Duplicate addresses are not allowed');
    }
    seen.add(key);
  }
}
