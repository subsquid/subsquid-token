import abi from 'ethereumjs-abi';
import {BigNumber as BN} from 'ethers';


function formatValue(value:any) {
  if (typeof (value) === 'number' || BN.isBigNumber(value)) {
    return value.toString();
  } else if (typeof (value) === 'string' && value.match(/\d+(\.\d+)?e(\+)?\d+/)) {
    return BN.from(value).toString();
  }
  return value;
}

function encodeCall(name:string, args:any = [], rawValues:any = []) {
  const values = rawValues.map(formatValue);
  const methodId = abi.methodID(name, args).toString('hex');
  const params = abi.rawEncode(args, values).toString('hex');
  return `0x${methodId}${params}`;
}
export default encodeCall;