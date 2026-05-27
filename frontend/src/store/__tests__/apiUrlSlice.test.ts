import { apiUrlSlice, setApiUrl } from "../apiUrlSlice";

const { reducer } = apiUrlSlice;

describe("apiUrlSlice", () => {
    // ── Initial state ─────────────────────────────────────────────────────────
    describe("initial state", () => {
        it("derives the API URL from the injected import.meta.env stubs", () => {
            // jest.setup.cjs sets VITE_API_HOST='http://localhost:3000' and
            // VITE_API_PATH='/api/v1', so the concatenation should produce:
            const expected = "http://localhost:3000/api/v1";
            expect(reducer(undefined, { type: "@@INIT" }).apiURL).toBe(
                expected
            );
        });
    });

    // ── Reducers ──────────────────────────────────────────────────────────────
    describe("setApiUrl", () => {
        it("updates apiURL to the provided value", () => {
            const newUrl = "http://production.example.com/api";
            const next = reducer(undefined, setApiUrl(newUrl));
            expect(next.apiURL).toBe(newUrl);
        });

        it("allows updating to an empty string", () => {
            const next = reducer(undefined, setApiUrl(""));
            expect(next.apiURL).toBe("");
        });

        it("overwrites a previously set URL", () => {
            const first = reducer(
                undefined,
                setApiUrl("http://first.example.com")
            );
            const second = reducer(
                first,
                setApiUrl("http://second.example.com")
            );
            expect(second.apiURL).toBe("http://second.example.com");
        });
    });

    // ── Action creators ────────────────────────────────────────────────────────
    describe("action creators", () => {
        it("setApiUrl produces the correct action type and payload", () => {
            const url = "http://example.com";
            const action = setApiUrl(url);
            expect(action.type).toBe("apiUrlSlice/setApiUrl");
            expect(action.payload).toBe(url);
        });
    });
});
