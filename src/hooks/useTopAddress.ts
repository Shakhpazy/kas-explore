// return {
//     timestamp: current?.timestamp ?? null,
//     ranking,
//   }

import { getTopAddress } from "#/api/address/Address";
import { useQuery } from "@tanstack/react-query";

 
export function useTopAddress() {
  return useQuery({
    queryKey: ['address', 'top'],
    queryFn: () => getTopAddress(),
    staleTime: 60_000,
  })
}
