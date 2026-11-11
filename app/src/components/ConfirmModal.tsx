import { useGame } from '../store/gameStore';

/** Modal xác nhận trước các hành động quan trọng (chiếm đất, nâng cấp lớn...) */
export default function ConfirmModal() {
  const confirm = useGame(s => s.confirm);
  const close = useGame(s => s.closeConfirm);
  if (!confirm) return null;
  return (
    <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4">
      <div className="pixel-border bg-panel p-6 max-w-sm w-full">
        <h3 className="font-pixel text-gold text-xs mb-3">{confirm.title}</h3>
        <p className="font-body text-xl mb-5">{confirm.text}</p>
        <div className="flex gap-3 justify-end">
          <button className="btn btn-red" onClick={close}>HUỶ</button>
          <button
            className="btn btn-green"
            onClick={() => { const fn = confirm.onOk; close(); fn(); }}
          >
            XÁC NHẬN
          </button>
        </div>
      </div>
    </div>
  );
}
