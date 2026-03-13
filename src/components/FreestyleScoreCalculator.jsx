import React, { useMemo, useState } from 'react';

const IJRU_RULES_URL =
    'https://rules.ijru.sport/technical-manual/calculations/freestyle/single-rope';
const IJRU_DIFFICULTY_URL =
    'https://rules.ijru.sport/judging-manual/freestyle/single-rope/difficulty';

// Constants taken from the inspiration Streamlit app (which cites IJRU Rulebook 4.0.0).
const MAX_PRESENTATION_AFFECT = 0.6;
const PRESENTATION_LIMITS = {
    entertainment: MAX_PRESENTATION_AFFECT * 0.25, // 0.15
    execution: MAX_PRESENTATION_AFFECT * 0.25, // 0.15
    musicality: MAX_PRESENTATION_AFFECT * 0.2, // 0.12
    creativity: MAX_PRESENTATION_AFFECT * 0.15, // 0.09
    variety: MAX_PRESENTATION_AFFECT * 0.15, // 0.09
};

function round2(n) {
    return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

// IJRU equation used in inspiration app: pointValue = round(0.1 * 1.5^level, 2)
function getPointValue(level) {
    const lv = Number(level);
    if (!Number.isFinite(lv) || lv === 0) return 0;
    return round2(0.1 * 1.5 ** lv);
}

function parseLevels(text) {
    const raw = (text ?? '').trim();
    if (!raw) return [];

    // Accept comma/semicolon/period separation (plus whitespace/newlines).
    // Also accept inputs like: "2, 3, 4" or "2;3;4" or "2 3 4".
    const normalized = raw
        .replace(/[;\n\r\t]+/g, ',')
        .replace(/[ ]+/g, ',')
        .replace(/[.]+/g, ',')
        .replace(/,+/g, ',')
        .replace(/^,|,$/g, '');

    return normalized
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => Number(s));
}

function validateLevels(levels) {
    if (levels.length === 0) return { ok: true, error: null };
    if (levels.some((n) => !Number.isFinite(n))) {
        return { ok: false, error: 'Some entries are not valid numbers.' };
    }
    if (levels.some((n) => n < 0)) {
        return { ok: false, error: 'Levels must be non-negative.' };
    }
    return { ok: true, error: null };
}

function calculateDifficultyRaw(levels) {
    return round2(levels.reduce((sum, lv) => sum + getPointValue(lv), 0));
}

function calculateNewDifficulty(levels) {
    // Inspiration app: averagedDifficulty = totalDifficultyRaw / 3 (Rulebook 4.0.0)
    return round2(calculateDifficultyRaw(levels) / 3);
}

function calculateOldDifficulty(levels) {
    // Inspiration app: oldDifficulty = totalDifficultyRaw (Rulebook 3.0.0)
    return round2(calculateDifficultyRaw(levels));
}

function calculatePresentationRanges(totalScore) {
    const ts = Number(totalScore) || 0;
    const addSub = (pct) => ({
        max: round2(ts + ts * pct),
        min: round2(ts - ts * pct),
    });

    return {
        presentation: addSub(MAX_PRESENTATION_AFFECT),
        entertainment: addSub(PRESENTATION_LIMITS.entertainment),
        execution: addSub(PRESENTATION_LIMITS.execution),
        musicality: addSub(PRESENTATION_LIMITS.musicality),
        creativity: addSub(PRESENTATION_LIMITS.creativity),
        variety: addSub(PRESENTATION_LIMITS.variety),
    };
}

function calculateEditedPresentation(totalScore, sliders) {
    const ts = Number(totalScore) || 0;
    const pct =
        (Number(sliders.entertainment) || 0) +
        (Number(sliders.execution) || 0) +
        (Number(sliders.musicality) || 0) +
        (Number(sliders.creativity) || 0) +
        (Number(sliders.variety) || 0);
    return {
        score: round2(ts + ts * pct),
        pct: round2(pct),
    };
}

function formatPct(p) {
    const n = Number(p) || 0;
    return `${round2(n * 100)}%`;
}

function Slider({ label, value, onChange, min, max, step = 0.01 }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-800">{label}</label>
                <span className="text-sm text-gray-600 tabular-nums">{formatPct(value)}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 tabular-nums">
                <span>{formatPct(min)}</span>
                <span>{formatPct(0)}</span>
                <span>{formatPct(max)}</span>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-2 text-sm font-medium rounded-md transition ${active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            type="button"
        >
            {children}
        </button>
    );
}

const OLD_VS_NEW_POINT_VALUES = [
    { level: 0.5, old: 0.12, next: 0.04 },
    { level: 1, old: 0.15, next: 0.05 },
    { level: 2, old: 0.23, next: 0.08 },
    { level: 3, old: 0.34, next: 0.11 },
    { level: 4, old: 0.51, next: 0.17 },
    { level: 5, old: 0.76, next: 0.25 },
    { level: 6, old: 1.14, next: 0.38 },
    { level: 7, old: 1.76, next: 0.57 },
    { level: 8, old: 2.56, next: 0.85 },
];

const GYMNASTICS_AND_POWER = [
    {
        level: 1,
        gymnastics: ['Cartwheel', 'Roundoff', 'Forward/backward roll', 'Butterfly Kick (B kick)'],
        power: [
            'Standing to Frog/Push-up without pulling the rope',
            'Frog/Push-up to standing without pulling the rope',
            'Basic power skill entrance',
        ],
    },
    {
        level: 2,
        gymnastics: ['Front Handspring', 'Kip', 'Dive roll'],
        power: ['Frog', 'Push-up', 'Crab', 'Split'],
    },
    {
        level: 3,
        gymnastics: [
            'Aerial',
            'Barani',
            'Back Handspring',
            '¾ flip (front ¾ flip landing in a crab position or back ¾ landing in a push-up position)',
        ],
        power: [
            'One-handed power Frog/Push-up to standing',
            'Frog from Two Feet (no revolutions of the rope)',
            'Frog to single bounce cross landing in standing',
        ],
    },
    {
        level: 4,
        gymnastics: ['Front Aerial', 'Front Flip', 'Back Flip', 'Butterfly Twist (B twist)'],
        power: ['Push-up to Pushup', 'Frog to Pushup', 'Punch Frog'],
    },
    {
        level: 5,
        gymnastics: [
            'Flips with twists (half or full)',
            'Front flip with double under',
            '¾ flip with triple under',
        ],
        power: [
            'One-handed Punch Frog',
            'Double Under Frog',
            'Push-Up to Push-Up or Belch with double under or cross',
        ],
    },
    {
        level: 6,
        gymnastics: [
            'Flips with 1.5 or 2 Spins',
            'Kip Whip',
            'Front Handspring Whip',
            'Backflip with Triple Under',
            'Front Flip with Triple Under',
        ],
        power: [
            'Split to backwards open single bounce landing in standing (must be full split with rope on the ground before pulling)',
        ],
    },
    {
        level: 7,
        gymnastics: ['Back Flip with a TJ', 'Kip Whip with a Cross'],
        power: ['Sunny D', 'Darkside', 'Triple under landing in Frog'],
    },
    {
        level: 8,
        gymnastics: ['Double Back', 'Triple Full', 'Back Flip Triple Under with an AS Cross'],
        power: ['Moneymaker'],
    },
];

const MULTIPLES_AND_ROPE_MANIPULATION = [
    {
        level: 0.5,
        multiples: [],
        rope: ['Foot work (performed at a slow pace)', 'Criss Cross', 'Basic arm wrap'],
    },
    {
        level: 1,
        multiples: ['Double Under'],
        rope: [
            'Restricted side-swing',
            'Toad',
            'Crougar',
            'EB',
            'Basic rope release',
            'Foot work (performed at a fast pace)',
        ],
    },
    {
        level: 2,
        multiples: ['Triple Under', 'Double Under with One-arm Restriction'],
        rope: ['AS', 'CL', 'TS', 'Elephant toad', 'KN', 'EM', 'Caboose', 'Mic release', 'Crougar wrap'],
    },
    {
        level: 3,
        multiples: [
            'Quadruple Under',
            'Triple Under TJ (Triple Under toad)',
            'Double Under AS',
            'Double Under mic',
            'Triple Under EK',
        ],
        rope: [
            'Lasso release caught in the air',
            'Forward French Trick',
            'One-arm restriction with a double wrap (For example, Toad jumped with double wrap)',
            'AS go-go/crazy-cross',
            'Catching a mic release in a one arm restriction',
        ],
    },
    {
        level: 4,
        multiples: [
            'Quintuple Under',
            'Quadruple Under TJ',
            'Triple Under EB TJ',
            'Triple Under AS',
            'Double Under AS×AS',
        ],
        rope: ['Backward French-trick', 'Catching mic release in backward two-arm restriction'],
    },
    {
        level: 5,
        multiples: [
            'Sextuple Under',
            'Quintuple Under EB',
            'Quadruple Under CL',
            'Hummingbird',
            'Double Under AS switch TS',
            'Double Under AS Switch CL',
        ],
        rope: [],
    },
    {
        level: 6,
        multiples: [
            'Quintuple Under AS',
            'Triple Under AS CL TS',
            'Quintuple EB open AS',
            'Quadruple Under AS×AS',
            'Backward Quadruple Under AS open',
            'landing in AS',
        ],
        rope: [],
    },
    {
        level: 7,
        multiples: [
            'Quintuple Under with under-the-leg mic caught in one handed restricted position',
            'Quintuple Under 360° with backward leg-over cross and forward leg-over cross',
        ],
        rope: [],
    },
    {
        level: 8,
        multiples: [
            'Quintuple with under-the-leg mic caught in a two handed restriction',
            'Backwards quintuple under TS open CL open AS',
        ],
        rope: [],
    },
];

export default function FreestyleScoreCalculator() {
    const [input, setInput] = useState('');
    const [version, setVersion] = useState('new'); // new=Rulebook 4.0.0, old=3.0.0
    const [section, setSection] = useState('calculator'); // calculator | reference

    const [sliders, setSliders] = useState({
        entertainment: 0,
        execution: 0,
        musicality: 0,
        creativity: 0,
        variety: 0,
    });

    const levels = useMemo(() => parseLevels(input), [input]);
    const validation = useMemo(() => validateLevels(levels), [levels]);

    const baseDifficulty = useMemo(() => {
        if (!validation.ok) return 0;
        return version === 'new' ? calculateNewDifficulty(levels) : calculateOldDifficulty(levels);
    }, [levels, validation.ok, version]);

    const ranges = useMemo(() => calculatePresentationRanges(baseDifficulty), [baseDifficulty]);
    const custom = useMemo(
        () => calculateEditedPresentation(baseDifficulty, sliders),
        [baseDifficulty, sliders]
    );

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                            Jump Rope Freestyle Score Calculator
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Aligned to IJRU 4.0.0 documentation.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <a
                            href={IJRU_RULES_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
                        >
                            IJRU scoring page
                        </a>
                        <a
                            href={IJRU_DIFFICULTY_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
                        >
                            IJRU difficulty page
                        </a>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <TabButton active={section === 'calculator'} onClick={() => setSection('calculator')}>
                        Calculator
                    </TabButton>
                    <TabButton active={section === 'reference'} onClick={() => setSection('reference')}>
                        Freestyle reference (levels/modifiers)
                    </TabButton>
                </div>
            </div>

            {section === 'calculator' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Inputs */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border p-5">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <TabButton active={version === 'new'} onClick={() => setVersion('new')}>
                                    New (Rulebook 4.0.0)
                                </TabButton>
                                <TabButton active={version === 'old'} onClick={() => setVersion('old')}>
                                    Old (Rulebook 3.0.0)
                                </TabButton>
                            </div>

                            <label className="block text-sm font-medium text-gray-800 mb-2">
                                Input difficulty levels (e.g. <span className="font-mono">2, 3, 4</span>)
                            </label>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                rows={3}
                                placeholder="2, 3, 4, 0.5..."
                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Tip: separators can be commas, spaces, semicolons, or periods.
                            </p>

                            {!validation.ok && (
                                <div className="mt-3 bg-red-50 text-red-700 px-4 py-3 rounded-md text-sm">
                                    {validation.error}
                                </div>
                            )}

                            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4 border">
                                    <div className="text-sm text-gray-600">Difficulty</div>
                                    <div className="text-2xl font-bold text-gray-900 tabular-nums">
                                        {round2(baseDifficulty).toFixed(2)}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {version === 'new'
                                            ? 'Computed as total difficulty point value ÷ 3.'
                                            : 'Computed as total difficulty point value.'}
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 border">
                                    <div className="text-sm text-gray-600">Custom presentation score</div>
                                    <div className="text-2xl font-bold text-gray-900 tabular-nums">
                                        {custom.score.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Custom presentation percent: <span className="font-medium">{formatPct(custom.pct)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-700">
                                            <th className="py-2 pr-4">Presentation type</th>
                                            <th className="py-2 pr-4">Max</th>
                                            <th className="py-2 pr-4">Min</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-800">
                                        {[
                                            ['Presentation', ranges.presentation],
                                            ['Entertainment', ranges.entertainment],
                                            ['Execution', ranges.execution],
                                            ['Musicality', ranges.musicality],
                                            ['Creativity', ranges.creativity],
                                            ['Variety', ranges.variety],
                                        ].map(([label, v]) => (
                                            <tr key={label} className="border-t">
                                                <td className="py-2 pr-4 font-medium">{label}</td>
                                                <td className="py-2 pr-4 tabular-nums">{v.max.toFixed(2)}</td>
                                                <td className="py-2 pr-4 tabular-nums">{v.min.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border p-5">
                            <h3 className="text-lg font-semibold text-gray-900">Rule change (difficulty score)</h3>
                            <p className="text-sm text-gray-700 mt-2">
                                Under Rulebook 4.0.0, the difficulty score is the average of the power difficulty score, the
                                wraps/releases difficulty score, and the multiples difficulty score. The inspiration calculator
                                models this as dividing total difficulty point value by 3.
                            </p>
                            <div className="mt-4 overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-700">
                                            <th className="py-2 pr-4">Level</th>
                                            <th className="py-2 pr-4">Old point value</th>
                                            <th className="py-2 pr-4">New point value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-800">
                                        {OLD_VS_NEW_POINT_VALUES.map((r) => (
                                            <tr key={r.level} className="border-t">
                                                <td className="py-2 pr-4 tabular-nums">{r.level}</td>
                                                <td className="py-2 pr-4 tabular-nums">{r.old.toFixed(2)}</td>
                                                <td className="py-2 pr-4 tabular-nums">{r.next.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-gray-500 mt-3">
                                For official definitions and edge-cases, use the IJRU links above.
                            </p>
                        </div>
                    </div>

                    {/* Presentation sliders */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border p-5">
                            <h3 className="text-lg font-semibold text-gray-900">Customize presentation</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Each slider is capped to the ranges used in the inspiration calculator.
                            </p>
                            <div className="mt-4 space-y-4">
                                <Slider
                                    label="Entertainment"
                                    value={sliders.entertainment}
                                    onChange={(v) => setSliders((s) => ({ ...s, entertainment: v }))}
                                    min={-PRESENTATION_LIMITS.entertainment}
                                    max={PRESENTATION_LIMITS.entertainment}
                                />
                                <Slider
                                    label="Execution"
                                    value={sliders.execution}
                                    onChange={(v) => setSliders((s) => ({ ...s, execution: v }))}
                                    min={-PRESENTATION_LIMITS.execution}
                                    max={PRESENTATION_LIMITS.execution}
                                />
                                <Slider
                                    label="Musicality"
                                    value={sliders.musicality}
                                    onChange={(v) => setSliders((s) => ({ ...s, musicality: v }))}
                                    min={-PRESENTATION_LIMITS.musicality}
                                    max={PRESENTATION_LIMITS.musicality}
                                />
                                <Slider
                                    label="Creativity"
                                    value={sliders.creativity}
                                    onChange={(v) => setSliders((s) => ({ ...s, creativity: v }))}
                                    min={-PRESENTATION_LIMITS.creativity}
                                    max={PRESENTATION_LIMITS.creativity}
                                />
                                <Slider
                                    label="Variety"
                                    value={sliders.variety}
                                    onChange={(v) => setSliders((s) => ({ ...s, variety: v }))}
                                    min={-PRESENTATION_LIMITS.variety}
                                    max={PRESENTATION_LIMITS.variety}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSliders({
                                            entertainment: 0,
                                            execution: 0,
                                            musicality: 0,
                                            creativity: 0,
                                            variety: 0,
                                        })
                                    }
                                    className="w-full mt-2 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm"
                                >
                                    Reset sliders
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border p-5">
                        <h3 className="text-lg font-semibold text-gray-900">Determining the level of a trick</h3>
                        <p className="text-sm text-gray-700 mt-2">
                            The following tables/modifiers are copied from the inspiration calculator, which cites IJRU
                            Judging Manual 4.0.0 (see link above).
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-5 overflow-x-auto">
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Gymnastics and Power</h4>
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-700">
                                    <th className="py-2 pr-4">Level</th>
                                    <th className="py-2 pr-4">Gymnastics</th>
                                    <th className="py-2 pr-4">Power</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-800">
                                {GYMNASTICS_AND_POWER.map((row) => (
                                    <tr key={row.level} className="border-t align-top">
                                        <td className="py-2 pr-4 tabular-nums font-medium">{row.level}</td>
                                        <td className="py-2 pr-4">
                                            <ul className="list-disc pl-5 space-y-1">
                                                {row.gymnastics.map((x) => (
                                                    <li key={x}>{x}</li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="py-2 pr-4">
                                            <ul className="list-disc pl-5 space-y-1">
                                                {row.power.map((x) => (
                                                    <li key={x}>{x}</li>
                                                ))}
                                            </ul>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="mt-4 text-sm text-gray-800">
                            <div className="font-semibold mb-2">Gymnastics and Power Modifiers</div>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>+1 for Cross performed with power or gymnastics skills and/or flips</li>
                                <li>+1 to the level of a multiple landing in Push-up, Split or Crab position</li>
                                <li>+2 to the level of the starting skill if landing in a frog position</li>
                                <li>+1 for assisted flips without supporting interaction</li>
                                <li>-1 for assisted flips with supporting interactions all the way around</li>
                                <li>
                                    +1 for every 90-degree turn in power when the rope is pulled (90° = +1, 180° = +2,
                                    270° = +3, etc.)
                                </li>
                                <li>
                                    -1 for gymnastics with rope held with only one hand and not jumping the rope (for example,
                                    one-hand handspring (L2) with both handles in one hand (-1) = L1; front aerial (L3) with
                                    both handles in one hand (-1) = L2)
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-5 overflow-x-auto">
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Multiples and Rope Manipulation</h4>
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-700">
                                    <th className="py-2 pr-4">Level</th>
                                    <th className="py-2 pr-4">Multiples</th>
                                    <th className="py-2 pr-4">Rope Manipulation</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-800">
                                {MULTIPLES_AND_ROPE_MANIPULATION.map((row) => (
                                    <tr key={row.level} className="border-t align-top">
                                        <td className="py-2 pr-4 tabular-nums font-medium">{row.level}</td>
                                        <td className="py-2 pr-4">
                                            {row.multiples.length ? (
                                                <ul className="list-disc pl-5 space-y-1">
                                                    {row.multiples.map((x) => (
                                                        <li key={x}>{x}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="py-2 pr-4">
                                            {row.rope.length ? (
                                                <ul className="list-disc pl-5 space-y-1">
                                                    {row.rope.map((x) => (
                                                        <li key={x}>{x}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="mt-4 text-sm text-gray-800 space-y-4">
                            <div>
                                <div className="font-semibold mb-2">Multiples Modifiers</div>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>
                                        +1 for body rotation more than 270° in twist or flip direction (for example, EK, BC, full
                                        twist)
                                    </li>
                                    <li>
                                        +1 for every additional 180° turned in the air beyond a 360° turn when jumped. (540° =
                                        total +2, 720° = total +3, 900° = total +4, etc.)
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <div className="font-semibold mb-2">Rope Manipulation Modifiers</div>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>+1 for switch crosses (AS×AS, criss-cross×criss-cross, AS×CL as long as the arm on top changes, etc.)</li>
                                    <li>+1 per layer for go-go's/crazy criss-cross (one hand crosses twice across body, leg or arm without uncrossing)</li>
                                    <li>+1 (max +3) per extra wrap layer for wraps</li>
                                    <li>+1 for changing the direction of rope movement in the air (Note: skills like EK where the rope continues in the same direction but the athlete turns doesn't count)</li>
                                    <li>+1 for switching handles</li>
                                    <li>+1 for transition jumps (jumping a one-hand restricted skill and in one jump, jumping the opposite side one-hand restricted skill, such as crougar-crougar)</li>
                                    <li>+1 for each restricted arm catching the release when catching a release in a one-arm restricted position</li>
                                    <li>+1 to the release for releasing a handle in a restricted position if, and only if, the hand is completely behind the body (behind the back or behind both legs)</li>
                                    <li>+1 for catching a release with something other than a hand (such as scooping the rope, squeezing it with a body part, or landing the rope on a foot, shoulder, or similar, jumping the rope with the rope caught on a body part)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

