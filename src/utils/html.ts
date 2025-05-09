import type { PopulatedTxnData } from '@/server/utils';
import { calculateTxAmounts, createFormattedOutputs } from './mempool';
import { truncateMiddle } from './strings';

export const constructTxnHtml = (txn: PopulatedTxnData) => {
  const amount = calculateTxAmounts(txn.apiTxn);
  const truncatedId = truncateMiddle(txn.txnLink.txnId, 12);
  const inputOutputRows = createFormattedOutputs(txn.apiTxn)
    .map(
      ([a, b, c]) => `<row gap-="1">
    <row self-="grow !basis" align-="center end">${truncateMiddle(a, 24)}</row>
    <span>${b}</span>
    <row self-="grow !basis">${truncateMiddle(c, 24)}</row>
</row>`,
    )
    .join('');

  return `
<row align-="between">
  <row>
    <span is-="badge" variant-="background2">${truncatedId}</span>
    <button size-="small" id="copy-id">&#xf4bb;</button>
  </row>
  <row gap-="1">
    ${
      txn.apiTxn.status.confirmed
        ? `<span is-="badge" variant-="green">Confirmed</span>`
        : `<span is-="badge" variant-="yellow">Pending</span>`
    }
  </row>
</row>
<ul marker-="tree">
  <li>
    <span>Amount:</span>
    <code id="txn-amount">${amount.output}</code> sats
  </li>
  <li>
    <span>Fee:</span>
    <code id="txn-fee">${amount.fee}</code> sats
  </li>
  <li>
    <span>Total:</span>
    <code id="txn-total">${amount.input}</code> sats
  </li>
</ul>
<details>
  <summary>Inputs / Outputs</summary>
  <column id="txn-inputs-outputs">
    ${inputOutputRows}
  </column>
</details>
<column>
  <row align-="between">
    <span is-="badge">OP_RETURN</span>
    <span is-="badge" variant-="background2">Raw</span>
  </row>
  <column id="txn-op-return">
  </column>
</column>`;
};
