// React UI — src/components/PersonalizationLinkBuilder.tsx
import { useMemo, useState } from "react";
import { buildSignedLink } from "../lib/useSignedLink";

const PLATFORMS = ["mailerLite","mailchimp","activeCampaign","hubspot","gohighlevel","generic"] as const;

export default function PersonalizationLinkBuilder() {
  const [platform, setPlatform] = useState<typeof PLATFORMS[number]>("mailerLite");
  const [templateId, setTemplateId] = useState("welcome-01");
  const [base, setBase] = useState(window.location.origin);
  const [src, setSrc] = useState(platform);
  const [userId, setUserId] = useState("");

  const url = useMemo(() => {
    return buildSignedLink(base, templateId, platform, userId ? { userId, src } : { src });
  }, [base, templateId, platform, src, userId]);

  return (
    <div className="p-4 border rounded-xl space-y-4">
      <h2 className="text-xl font-bold">Personalization Link Builder</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span>Platform</span>
          <select className="border rounded p-2" value={platform} onChange={e => setPlatform(e.target.value as any)}>
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span>Template ID</span>
          <input className="border rounded p-2" value={templateId} onChange={e => setTemplateId(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span>Base URL</span>
          <input className="border rounded p-2" value={base} onChange={e => setBase(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span>Source (utm/src)</span>
          <input className="border rounded p-2" value={src} onChange={e => setSrc(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span>User ID (for credit billing, optional)</span>
          <input className="border rounded p-2" value={userId} onChange={e => setUserId(e.target.value)} />
        </label>
      </div>

      <div className="bg-gray-50 p-3 rounded border">
        <div className="text-sm text-gray-600 mb-1">Signed Link</div>
        <textarea readOnly className="w-full h-28 p-2 font-mono text-sm border rounded">{url}</textarea>
      </div>

      <p className="text-sm text-gray-600">
        Paste this link into your email button/image href. Your ESP will replace merge fields per recipient.
        For **production-secure** signatures, build links via a server function.
      </p>
    </div>
  );
}