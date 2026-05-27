import { spinnerSlice, showSpinner, hideSpinner, isSpinnerVisible } from '../spinnerSlice';
import type { RootState } from '../store';

const { reducer } = spinnerSlice;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const buildState = (visible: boolean) =>
  ({ spinner: { visible } } as unknown as RootState);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('spinnerSlice', () => {
  // ── Initial state ─────────────────────────────────────────────────────────
  describe('initial state', () => {
    it('starts with visible: false', () => {
      expect(reducer(undefined, { type: '@@INIT' })).toEqual({ visible: false });
    });
  });

  // ── Reducers ──────────────────────────────────────────────────────────────
  describe('reducers', () => {
    describe('showSpinner', () => {
      it('sets visible to true', () => {
        const next = reducer({ visible: false }, showSpinner());
        expect(next.visible).toBe(true);
      });

      it('is idempotent when already visible', () => {
        const next = reducer({ visible: true }, showSpinner());
        expect(next.visible).toBe(true);
      });
    });

    describe('hideSpinner', () => {
      it('sets visible to false', () => {
        const next = reducer({ visible: true }, hideSpinner());
        expect(next.visible).toBe(false);
      });

      it('is idempotent when already hidden', () => {
        const next = reducer({ visible: false }, hideSpinner());
        expect(next.visible).toBe(false);
      });
    });

    it('toggling show then hide returns to false', () => {
      const afterShow = reducer(undefined, showSpinner());
      const afterHide = reducer(afterShow, hideSpinner());
      expect(afterHide.visible).toBe(false);
    });

    it('toggling hide then show returns to true', () => {
      const afterHide = reducer(undefined, hideSpinner());
      const afterShow = reducer(afterHide, showSpinner());
      expect(afterShow.visible).toBe(true);
    });
  });

  // ── Selectors ─────────────────────────────────────────────────────────────
  describe('isSpinnerVisible selector', () => {
    it('returns false when spinner is hidden', () => {
      expect(isSpinnerVisible(buildState(false))).toBe(false);
    });

    it('returns true when spinner is visible', () => {
      expect(isSpinnerVisible(buildState(true))).toBe(true);
    });
  });

  // ── Action creators ────────────────────────────────────────────────────────
  describe('action creators', () => {
    it('showSpinner produces the correct action type', () => {
      expect(showSpinner().type).toBe('spinnerSlice/showSpinner');
    });

    it('hideSpinner produces the correct action type', () => {
      expect(hideSpinner().type).toBe('spinnerSlice/hideSpinner');
    });
  });
});
