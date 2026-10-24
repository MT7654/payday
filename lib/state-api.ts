import { failure, json, limitedBody, sameOrigin } from './http.ts';
import { saveSchema } from './state-schema.ts';
import { clearState, readState, writeState, type StateDatabase } from './state-store.ts';
export function stateHandlers(deps: { owner: () => Promise<string>; database: () => StateDatabase; configured: () => boolean }) {
  return {
    async GET() {
      try { const id = await deps.owner(); return json({ ...await readState(deps.database(), id), configured: deps.configured() }); }
      catch (e) { return failure(e); }
    },
    async PUT(request: Request) {
      try {
        sameOrigin(request);
        const id = await deps.owner();
        const body = saveSchema.parse(await limitedBody(request));
        return json(await writeState(deps.database(), id, body.state, body.revision));
      } catch (e) { return failure(e); }
    },
    async DELETE(request: Request) {
      try {
        sameOrigin(request);
        const id = await deps.owner();
        return json({ ok: true, ...await clearState(deps.database(), id) });
      } catch (e) { return failure(e); }
    },
  };
}
