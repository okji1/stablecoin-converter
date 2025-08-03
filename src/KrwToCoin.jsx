import React, { useState, useMemo } from 'react';

const KrwToCoin = ({ stablecoinData, upbitData }) => {
  const [krwAmount, setKrwAmount] = useState('100000');

  const handleKrwChange = (e) => {
    const value = e.target.value.replace(/,/g, '');
    if (!isNaN(value)) {
      setKrwAmount(value);
    }
  };

  const allCoins = useMemo(() => {
    const stablecoins = Object.keys(stablecoinData).map(symbol => ({ ...stablecoinData[symbol], symbol, type: 'stable' }));
    const normalCoins = Object.keys(upbitData).map(symbol => ({ ...upbitData[symbol], symbol, type: 'normal' }));
    return [...stablecoins, ...normalCoins];
  }, [stablecoinData, upbitData]);

  const numericKrw = parseFloat(krwAmount) || 0;

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">💰 원화 입력</label>
        <div className="relative">
          <input
            type="text"
            value={Number(krwAmount).toLocaleString('ko-KR')}
            onChange={handleKrwChange}
            className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-2xl font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#14B8A6]"
            placeholder="금액 입력 (예: 10,000)"
          />
           <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-medium text-gray-400">KRW</span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">🔄 변환 결과</h3>
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          {allCoins.map(coin => {
            const coinAmount = coin.price > 0 ? (numericKrw / coin.price).toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0';
            return (
              <div key={coin.symbol} className="flex justify-between items-center text-sm">
                <span className={`font-semibold ${coin.type === 'stable' ? 'text-blue-600' : 'text-gray-800'}`}>{coin.symbol}</span>
                <span className="font-mono text-gray-600">{coinAmount} 개</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KrwToCoin;
