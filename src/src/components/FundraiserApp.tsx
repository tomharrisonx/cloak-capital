import { useMemo, useState } from 'react';
import { Contract, formatUnits, parseUnits, hexlify, toUtf8Bytes } from 'ethers';
import { useAccount, useReadContract } from 'wagmi';
import { isAddress } from 'viem';
import { Header } from './Header';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';
import {
  FUNDRAISER_ABI,
  FUNDRAISER_ADDRESS,
  WETH_ABI,
  WETH_ADDRESS,
} from '../config/contracts';
import '../styles/FundraiserApp.css';

const ZERO_HANDLE = '0x' + '0'.repeat(64);

const formatAddress = (value?: string) => {
  if (!value || value.length < 10) return '—';
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
};

const formatDateTime = (value?: bigint) => {
  if (!value || value === 0n) return '—';
  return new Date(Number(value) * 1000).toLocaleString();
};

export function FundraiserApp() {
  const { address, isConnected } = useAccount();
  const signerPromise = useEthersSigner();
  const { instance, isLoading: zamaLoading, error: zamaError } = useZamaInstance();

  const [fundraiserAddress, setFundraiserAddress] = useState(FUNDRAISER_ADDRESS);
  const [wethAddress, setWethAddress] = useState(WETH_ADDRESS);

  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionNote, setContributionNote] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [campaignNameInput, setCampaignNameInput] = useState('');
  const [campaignTargetInput, setCampaignTargetInput] = useState('');
  const [campaignEndInput, setCampaignEndInput] = useState('');

  const [contributeMessage, setContributeMessage] = useState<string | null>(null);
  const [mintMessage, setMintMessage] = useState<string | null>(null);
  const [ownerMessage, setOwnerMessage] = useState<string | null>(null);
  const [decryptMessage, setDecryptMessage] = useState<string | null>(null);

  const [isContributing, setIsContributing] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isUpdatingCampaign, setIsUpdatingCampaign] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isDecryptingContribution, setIsDecryptingContribution] = useState(false);
  const [isDecryptingTotal, setIsDecryptingTotal] = useState(false);
  const [isDecryptingBalance, setIsDecryptingBalance] = useState(false);

  const [decryptedContribution, setDecryptedContribution] = useState<bigint | null>(null);
  const [decryptedTotal, setDecryptedTotal] = useState<bigint | null>(null);
  const [decryptedBalance, setDecryptedBalance] = useState<bigint | null>(null);

  const fundraiserReady = useMemo(() => isAddress(fundraiserAddress), [fundraiserAddress]);
  const tokenReady = useMemo(() => isAddress(wethAddress), [wethAddress]);
  const addressesReady = fundraiserReady && tokenReady;

  const fundraiserAddressSafe = fundraiserReady ? (fundraiserAddress as `0x${string}`) : undefined;
  const wethAddressSafe = tokenReady ? (wethAddress as `0x${string}`) : undefined;

  const { data: campaignName } = useReadContract({
    address: fundraiserAddressSafe,
    abi: FUNDRAISER_ABI,
    functionName: 'campaignName',
    query: { enabled: fundraiserReady },
  });

  const { data: targetAmount } = useReadContract({
    address: fundraiserAddressSafe,
    abi: FUNDRAISER_ABI,
    functionName: 'targetAmount',
    query: { enabled: fundraiserReady },
  });

  const { data: endTime } = useReadContract({
    address: fundraiserAddressSafe,
    abi: FUNDRAISER_ABI,
    functionName: 'endTime',
    query: { enabled: fundraiserReady },
  });

  const { data: owner } = useReadContract({
    address: fundraiserAddressSafe,
    abi: FUNDRAISER_ABI,
    functionName: 'owner',
    query: { enabled: fundraiserReady },
  });

  const { data: isEnded } = useReadContract({
    address: fundraiserAddressSafe,
    abi: FUNDRAISER_ABI,
    functionName: 'isEnded',
    query: { enabled: fundraiserReady },
  });

  const { data: isActive } = useReadContract({
    address: fundraiserAddressSafe,
    abi: FUNDRAISER_ABI,
    functionName: 'isActive',
    query: { enabled: fundraiserReady },
  });

  const { data: tokenFromContract } = useReadContract({
    address: fundraiserAddressSafe,
    abi: FUNDRAISER_ABI,
    functionName: 'token',
    query: { enabled: fundraiserReady },
  });

  const { data: encryptedTotal, refetch: refetchTotal } = useReadContract({
    address: fundraiserAddressSafe,
    abi: FUNDRAISER_ABI,
    functionName: 'totalRaised',
    query: { enabled: fundraiserReady },
  });

  const { data: encryptedContribution, refetch: refetchContribution } = useReadContract({
    address: fundraiserAddressSafe,
    abi: FUNDRAISER_ABI,
    functionName: 'contributionOf',
    args: address ? [address] : undefined,
    query: { enabled: fundraiserReady && !!address },
  });

  const { data: tokenName } = useReadContract({
    address: wethAddressSafe,
    abi: WETH_ABI,
    functionName: 'name',
    query: { enabled: tokenReady },
  });

  const { data: tokenSymbol } = useReadContract({
    address: wethAddressSafe,
    abi: WETH_ABI,
    functionName: 'symbol',
    query: { enabled: tokenReady },
  });

  const { data: tokenDecimals } = useReadContract({
    address: wethAddressSafe,
    abi: WETH_ABI,
    functionName: 'decimals',
    query: { enabled: tokenReady },
  });

  const { data: encryptedBalance, refetch: refetchBalance } = useReadContract({
    address: wethAddressSafe,
    abi: WETH_ABI,
    functionName: 'confidentialBalanceOf',
    args: address ? [address] : undefined,
    query: { enabled: tokenReady && !!address },
  });

  const decimals = Number(tokenDecimals ?? 6);
  const formattedTarget = typeof targetAmount === 'bigint' ? formatUnits(targetAmount, decimals) : '—';
  const formattedDecryptedContribution =
    decryptedContribution !== null ? formatUnits(decryptedContribution, decimals) : '—';
  const formattedDecryptedTotal = decryptedTotal !== null ? formatUnits(decryptedTotal, decimals) : '—';
  const formattedDecryptedBalance = decryptedBalance !== null ? formatUnits(decryptedBalance, decimals) : '—';

  const tokenMismatch =
    typeof tokenFromContract === 'string' &&
    tokenReady &&
    tokenFromContract.toLowerCase() !== wethAddress.toLowerCase();

  const ownerMatch =
    typeof owner === 'string' && address ? owner.toLowerCase() === address.toLowerCase() : false;

  const campaignStatus = isEnded ? 'Ended' : isActive ? 'Active' : 'Expired';

  const decryptHandle = async (handle: string, contractAddress: string) => {
    if (!instance || !address || !signerPromise) {
      throw new Error('Wallet connection and encryption service are required.');
    }
    if (handle === ZERO_HANDLE) {
      return 0n;
    }

    const keypair = instance.generateKeypair();
    const handleContractPairs = [{ handle, contractAddress }];
    const startTimeStamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = '10';
    const contractAddresses = [contractAddress];

    const eip712 = instance.createEIP712(keypair.publicKey, contractAddresses, startTimeStamp, durationDays);
    const signer = await signerPromise;
    if (!signer) {
      throw new Error('Signer not available.');
    }

    const signature = await signer.signTypedData(
      eip712.domain,
      { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
      eip712.message,
    );

    const result = await instance.userDecrypt(
      handleContractPairs,
      keypair.privateKey,
      keypair.publicKey,
      signature.replace('0x', ''),
      contractAddresses,
      address,
      startTimeStamp,
      durationDays,
    );

    const clearValue = result[handle] ?? '0';
    return BigInt(clearValue);
  };

  const handleContribute = async () => {
    setContributeMessage(null);
    if (!addressesReady || !fundraiserAddressSafe || !wethAddressSafe) {
      setContributeMessage('Please enter valid contract addresses.');
      return;
    }
    if (!address || !instance || !signerPromise) {
      setContributeMessage('Connect your wallet to contribute.');
      return;
    }
    if (!contributionAmount) {
      setContributeMessage('Enter an amount to contribute.');
      return;
    }

    setIsContributing(true);
    try {
      const amount = parseUnits(contributionAmount, decimals);
      if (amount <= 0n) {
        throw new Error('Amount must be greater than zero.');
      }

      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Signer not available.');
      }

      const tokenContract = new Contract(wethAddressSafe, WETH_ABI, signer);
      const input = instance.createEncryptedInput(wethAddressSafe, address);
      input.add64(amount);
      const encryptedInput = await input.encrypt();

      const dataPayload = contributionNote
        ? hexlify(toUtf8Bytes(contributionNote.slice(0, 64)))
        : '0x';

      const tx = await tokenContract.confidentialTransferAndCall(
        fundraiserAddressSafe,
        encryptedInput.handles[0],
        encryptedInput.inputProof,
        dataPayload,
      );
      await tx.wait();

      setContributeMessage('Contribution submitted successfully.');
      setContributionAmount('');
      setContributionNote('');
      await Promise.all([refetchContribution(), refetchTotal()]);
    } catch (error) {
      console.error(error);
      setContributeMessage(error instanceof Error ? error.message : 'Contribution failed.');
    } finally {
      setIsContributing(false);
    }
  };

  const handleMint = async () => {
    setMintMessage(null);
    if (!tokenReady || !wethAddressSafe) {
      setMintMessage('Please enter a valid token address.');
      return;
    }
    if (!address || !signerPromise) {
      setMintMessage('Connect your wallet to mint.');
      return;
    }
    if (!mintAmount) {
      setMintMessage('Enter an amount to mint.');
      return;
    }

    setIsMinting(true);
    try {
      const amount = parseUnits(mintAmount, decimals);
      if (amount <= 0n) {
        throw new Error('Amount must be greater than zero.');
      }

      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Signer not available.');
      }

      const tokenContract = new Contract(wethAddressSafe, WETH_ABI, signer);
      const tx = await tokenContract.mint(address, amount);
      await tx.wait();

      setMintMessage('Mint completed.');
      setMintAmount('');
      await refetchBalance();
    } catch (error) {
      console.error(error);
      setMintMessage(error instanceof Error ? error.message : 'Mint failed.');
    } finally {
      setIsMinting(false);
    }
  };

  const handleUpdateCampaign = async () => {
    setOwnerMessage(null);
    if (!fundraiserReady || !fundraiserAddressSafe) {
      setOwnerMessage('Please enter a valid fundraiser address.');
      return;
    }
    if (!signerPromise) {
      setOwnerMessage('Connect your wallet to update the campaign.');
      return;
    }
    if (!campaignNameInput || !campaignTargetInput || !campaignEndInput) {
      setOwnerMessage('Fill in name, target, and end time.');
      return;
    }

    const endTimestamp = Math.floor(new Date(campaignEndInput).getTime() / 1000);
    if (!Number.isFinite(endTimestamp) || endTimestamp <= 0) {
      setOwnerMessage('Provide a valid end time.');
      return;
    }

    setIsUpdatingCampaign(true);
    try {
      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Signer not available.');
      }

      const target = parseUnits(campaignTargetInput, decimals);
      if (target <= 0n) {
        throw new Error('Target must be greater than zero.');
      }

      const fundraiserContract = new Contract(fundraiserAddressSafe, FUNDRAISER_ABI, signer);
      const tx = await fundraiserContract.updateCampaign(
        campaignNameInput.trim(),
        target,
        endTimestamp,
      );
      await tx.wait();

      setOwnerMessage('Campaign updated.');
      setCampaignNameInput('');
      setCampaignTargetInput('');
      setCampaignEndInput('');
    } catch (error) {
      console.error(error);
      setOwnerMessage(error instanceof Error ? error.message : 'Campaign update failed.');
    } finally {
      setIsUpdatingCampaign(false);
    }
  };

  const handleEndCampaign = async () => {
    setOwnerMessage(null);
    if (!fundraiserReady || !fundraiserAddressSafe) {
      setOwnerMessage('Please enter a valid fundraiser address.');
      return;
    }
    if (!signerPromise) {
      setOwnerMessage('Connect your wallet to end the campaign.');
      return;
    }

    setIsEnding(true);
    try {
      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Signer not available.');
      }

      const fundraiserContract = new Contract(fundraiserAddressSafe, FUNDRAISER_ABI, signer);
      const tx = await fundraiserContract.endFundraising();
      await tx.wait();
      setOwnerMessage('Campaign ended and funds withdrawn.');
      await refetchTotal();
    } catch (error) {
      console.error(error);
      setOwnerMessage(error instanceof Error ? error.message : 'End campaign failed.');
    } finally {
      setIsEnding(false);
    }
  };

  const handleDecryptContribution = async () => {
    setDecryptMessage(null);
    if (!encryptedContribution || typeof encryptedContribution !== 'string' || !fundraiserAddressSafe) {
      setDecryptMessage('No contribution handle available.');
      return;
    }
    setIsDecryptingContribution(true);
    try {
      const value = await decryptHandle(encryptedContribution, fundraiserAddressSafe);
      setDecryptedContribution(value);
    } catch (error) {
      console.error(error);
      setDecryptMessage(error instanceof Error ? error.message : 'Decryption failed.');
    } finally {
      setIsDecryptingContribution(false);
    }
  };

  const handleDecryptTotal = async () => {
    setDecryptMessage(null);
    if (!encryptedTotal || typeof encryptedTotal !== 'string' || !fundraiserAddressSafe) {
      setDecryptMessage('No total handle available.');
      return;
    }
    setIsDecryptingTotal(true);
    try {
      const value = await decryptHandle(encryptedTotal, fundraiserAddressSafe);
      setDecryptedTotal(value);
    } catch (error) {
      console.error(error);
      setDecryptMessage(error instanceof Error ? error.message : 'Decryption failed.');
    } finally {
      setIsDecryptingTotal(false);
    }
  };

  const handleDecryptBalance = async () => {
    setDecryptMessage(null);
    if (!encryptedBalance || typeof encryptedBalance !== 'string' || !wethAddressSafe) {
      setDecryptMessage('No balance handle available.');
      return;
    }
    setIsDecryptingBalance(true);
    try {
      const value = await decryptHandle(encryptedBalance, wethAddressSafe);
      setDecryptedBalance(value);
    } catch (error) {
      console.error(error);
      setDecryptMessage(error instanceof Error ? error.message : 'Decryption failed.');
    } finally {
      setIsDecryptingBalance(false);
    }
  };

  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <section className="hero-card">
          <div className="hero-left">
            <p className="hero-label">Campaign Snapshot</p>
            <h2 className="hero-title">{campaignName || 'Unnamed Campaign'}</h2>
            <p className="hero-meta">
              Status: <span className={`status-pill status-${campaignStatus.toLowerCase()}`}>{campaignStatus}</span>
            </p>
            <div className="hero-grid">
              <div>
                <p className="meta-label">Target</p>
                <p className="meta-value">{formattedTarget} {tokenSymbol || 'wETH'}</p>
              </div>
              <div>
                <p className="meta-label">End Time</p>
                <p className="meta-value">{formatDateTime(endTime as bigint)}</p>
              </div>
              <div>
                <p className="meta-label">Owner</p>
                <p className="meta-value">{formatAddress(owner as string)}</p>
              </div>
              <div>
                <p className="meta-label">Token</p>
                <p className="meta-value">
                  {tokenName ? `${tokenName} (${tokenSymbol || 'wETH'})` : tokenSymbol || 'wETH'}
                </p>
              </div>
              <div>
                <p className="meta-label">Fundraiser</p>
                <p className="meta-value">{formatAddress(fundraiserAddress)}</p>
              </div>
            </div>
          </div>
          <div className="hero-right">
            <div className="info-card">
              <p className="info-title">Encrypted Total Raised</p>
              <p className="info-handle">{encryptedTotal ? formatAddress(encryptedTotal as string) : '—'}</p>
              <p className="info-subtitle">Decrypt as owner to view total in clear text.</p>
              <button
                className="primary-button"
                onClick={handleDecryptTotal}
                disabled={!ownerMatch || isDecryptingTotal || !encryptedTotal || zamaLoading}
              >
                {isDecryptingTotal ? 'Decrypting...' : ownerMatch ? 'Decrypt Total' : 'Owner Only'}
              </button>
              <p className="info-clear">Clear total: {formattedDecryptedTotal} {tokenSymbol || 'wETH'}</p>
            </div>
          </div>
        </section>

        <section className="panel setup-panel">
          <div>
            <h3>Contract Setup</h3>
            <p className="panel-subtitle">
              Provide the deployed fundraiser and token addresses to load data and contribute.
            </p>
          </div>
          <div className="form-grid">
            <label className="form-field">
              <span>Fundraiser Address</span>
              <input
                value={fundraiserAddress}
                onChange={(event) => setFundraiserAddress(event.target.value.trim())}
                placeholder="0x..."
              />
              {!fundraiserReady && fundraiserAddress && (
                <span className="form-hint error">Enter a valid address.</span>
              )}
            </label>
            <label className="form-field">
              <span>Token Address (wETH)</span>
              <input
                value={wethAddress}
                onChange={(event) => setWethAddress(event.target.value.trim())}
                placeholder="0x..."
              />
              {!tokenReady && wethAddress && (
                <span className="form-hint error">Enter a valid address.</span>
              )}
              {tokenMismatch && (
                <span className="form-hint warning">Token does not match fundraiser contract.</span>
              )}
            </label>
          </div>
        </section>

        <section className="panel contribute-panel">
          <div className="panel-header">
            <h3>Contribute</h3>
            <p className="panel-subtitle">
              Your contribution amount is encrypted before submission.
            </p>
          </div>
          <div className="form-grid">
            <label className="form-field">
              <span>Amount ({tokenSymbol || 'wETH'})</span>
              <input
                value={contributionAmount}
                onChange={(event) => setContributionAmount(event.target.value)}
                placeholder={`e.g. 250.00`}
              />
            </label>
            <label className="form-field">
              <span>Note (optional)</span>
              <input
                value={contributionNote}
                onChange={(event) => setContributionNote(event.target.value)}
                placeholder="Visible on-chain as event data"
              />
            </label>
          </div>
          <div className="button-row">
            <button
              className="primary-button"
              onClick={handleContribute}
              disabled={!isConnected || isContributing || !addressesReady || !isActive || zamaLoading}
            >
              {isContributing ? 'Submitting...' : isActive ? 'Submit Contribution' : 'Campaign Closed'}
            </button>
            <span className="inline-status">{contributeMessage}</span>
          </div>
        </section>

        <section className="panel status-panel">
          <div>
            <h3>Your Confidential Data</h3>
            <p className="panel-subtitle">
              Decrypt your contribution and token balance using your wallet signature.
            </p>
          </div>
          <div className="status-grid">
            <div className="status-card">
              <p className="status-label">Contribution Handle</p>
              <p className="status-value">{encryptedContribution ? formatAddress(encryptedContribution as string) : '—'}</p>
              <button
                className="secondary-button"
                onClick={handleDecryptContribution}
                disabled={!encryptedContribution || isDecryptingContribution || zamaLoading}
              >
                {isDecryptingContribution ? 'Decrypting...' : 'Decrypt Contribution'}
              </button>
              <p className="status-clear">Clear contribution: {formattedDecryptedContribution} {tokenSymbol || 'wETH'}</p>
            </div>
            <div className="status-card">
              <p className="status-label">Token Balance Handle</p>
              <p className="status-value">{encryptedBalance ? formatAddress(encryptedBalance as string) : '—'}</p>
              <button
                className="secondary-button"
                onClick={handleDecryptBalance}
                disabled={!encryptedBalance || isDecryptingBalance || zamaLoading}
              >
                {isDecryptingBalance ? 'Decrypting...' : 'Decrypt Balance'}
              </button>
              <p className="status-clear">Clear balance: {formattedDecryptedBalance} {tokenSymbol || 'wETH'}</p>
            </div>
          </div>
          {decryptMessage && <p className="inline-status warning">{decryptMessage}</p>}
        </section>

        <section className="panel wallet-panel">
          <div>
            <h3>Wallet Tools</h3>
            <p className="panel-subtitle">
              Mint test tokens for contributing on Sepolia.
            </p>
          </div>
          <div className="form-grid">
            <label className="form-field">
              <span>Mint Amount ({tokenSymbol || 'wETH'})</span>
              <input
                value={mintAmount}
                onChange={(event) => setMintAmount(event.target.value)}
                placeholder="e.g. 1000"
              />
            </label>
          </div>
          <div className="button-row">
            <button
              className="secondary-button"
              onClick={handleMint}
              disabled={!isConnected || isMinting || !tokenReady}
            >
              {isMinting ? 'Minting...' : 'Mint wETH'}
            </button>
            <span className="inline-status">{mintMessage}</span>
          </div>
        </section>

        <section className="panel owner-panel">
          <div>
            <h3>Owner Controls</h3>
            <p className="panel-subtitle">
              Update campaign settings or end fundraising at any time.
            </p>
          </div>
          <div className="form-grid">
            <label className="form-field">
              <span>Campaign Name</span>
              <input
                value={campaignNameInput}
                onChange={(event) => setCampaignNameInput(event.target.value)}
                placeholder={campaignName || 'New campaign name'}
              />
            </label>
            <label className="form-field">
              <span>Target ({tokenSymbol || 'wETH'})</span>
              <input
                value={campaignTargetInput}
                onChange={(event) => setCampaignTargetInput(event.target.value)}
                placeholder={formattedTarget}
              />
            </label>
            <label className="form-field">
              <span>End Time</span>
              <input
                type="datetime-local"
                value={campaignEndInput}
                onChange={(event) => setCampaignEndInput(event.target.value)}
              />
            </label>
          </div>
          <div className="button-row">
            <button
              className="primary-button"
              onClick={handleUpdateCampaign}
              disabled={!ownerMatch || isUpdatingCampaign}
            >
              {isUpdatingCampaign ? 'Updating...' : ownerMatch ? 'Update Campaign' : 'Owner Only'}
            </button>
            <button
              className="danger-button"
              onClick={handleEndCampaign}
              disabled={!ownerMatch || isEnding}
            >
              {isEnding ? 'Ending...' : 'End & Withdraw'}
            </button>
            <span className="inline-status">{ownerMessage}</span>
          </div>
        </section>

        <section className="panel footer-panel">
          <div>
            <h3>Encryption Status</h3>
            <p className="panel-subtitle">
              {zamaLoading && 'Initializing encryption service...'}
              {!zamaLoading && zamaError && `Encryption error: ${zamaError}`}
              {!zamaLoading && !zamaError && 'Encryption service is ready.'}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
