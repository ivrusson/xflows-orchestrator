# Node Lifecycle (Host + XState)

For each node, the Host follows a predictable lifecycle that aligns with XState capabilities:

1. **enter(node)**  
   - Guards check (if any).  
   - `bind`: resolve inputs (query/storage/context) and **assign** into machine context.
2. **resolve(node)**  
   - Execute `invoke` declarations (HTTP/compute).  
   - Assign results to context (`assignTo`) or raise `onError`.
3. **render(node)**  
   - Mount the MFE defined in `meta.view` with `contextSlice` + `send(event)` bridge.
4. **interact**  
   - The MFE emits **domain events**; Host forwards them to the machine via `send`.
5. **effects/commit**  
   - Transitions can run `actions` (assign/track/toast/etc.).
6. **leave(node)**  
   - Unmount MFE, abort pending requests, clear timers.

This maps to XState:
- `entry/exit` for lifecycle hooks
- `invoke` for async effects
- `assign` for context updates
- `on` transitions for domain events
