// Shuffle icon — flaticon #9936323 style (two crossing arrows)
export default function BotAvatar() {
  return (
    <div className="bot-avatar" title="VoiceToSQL">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Top arrow: left to right */}
        <polyline points="16 3 21 3 21 8" />
        <line x1="4" y1="20" x2="21" y2="3" />
        {/* Bottom arrow: right to left with curve */}
        <polyline points="21 16 21 21 16 21" />
        <line x1="15" y1="15" x2="21" y2="21" />
        <line x1="4" y1="4" x2="9" y2="9" />
      </svg>
    </div>
  );
}
