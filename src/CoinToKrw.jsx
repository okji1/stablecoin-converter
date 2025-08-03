import React, { useState, useMemo } from 'react';

const CoinToKrw = ({ stablecoinData, upbitData }) => {
  const [coinAmount, setCoinAmount] = useState('1');
  const [selectedCoin, setSelectedCoin] = useState('USDT');

  const allCoins = useMemo(() => {
    const stablecoins = Object.keys(stablecoinData).map(symbol => ({ ...stablecoinData[symbol], symbol, type: 'stable' }));
    const normalCoins = Object.keys(upbitData).map(symbol => ({ ...upbitData[symbol], symbol, type: 'normal' }));
    return [...stablecoins, ...normalCoins];
  }, [stablecoinData, upbitData]);

  const selectedCoinData = allCoins.find(c => c.symbol === selectedCoin);
  const selectedCoinPrice = selectedCoinData?.price || 0;

  const handleCoinAmountChange = (e) => {
    setCoinAmount(e.target.value);
  };

  const handleCoinChange = (e) => {
    setSelectedCoin(e.target.value);
  };

  const numericCoinAmount = parseFloat(coinAmount) || 0;
  const krwResult = (numericCoinAmount * selectedCoinPrice).toLocaleString('ko-KR', { maximumFractionDigits: 0 });

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">🪙 코인 선택 & 개수 입력</label>
        <div className="grid grid-cols-2 gap-4">
          <select
            value={selectedCoin}
            onChange={handleCoinChange}
            className="w-full bg-gray-100 border-none rounded-lg px-3 py-3 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
          >
            {allCoins.map((coin) => (
              <option key={coin.symbol} value={coin.symbol}>{coin.symbol}</option>
            ))}
          </select>
          <input
            type="text"
            value={coinAmount}
            onChange={handleCoinAmountChange}
            className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-xl font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#14B8A6]"
            placeholder="수량 입력"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">🔄 변환 결과</h3>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">
            {numericCoinAmount.toLocaleString()} {selectedCoin} = <span className="text-[#00A495]">{krwResult} KRW</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            (1 {selectedCoin} ≈ {selectedCoinPrice.toLocaleString('ko-KR')} KRW)
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoinToKrw;
