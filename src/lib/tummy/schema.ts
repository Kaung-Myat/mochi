import { z } from "zod";

export const symptomValues = [
  "pain_cramp",
  "bloating",
  "nausea",
  "heartburn",
  "diarrhea",
  "constipation",
  "gas",
  "other",
] as const;

export const symptomSchema = z.enum(symptomValues);
export const locationSchema = z.enum(["upper", "lower", "left", "right", "all_over", "unsure"]);
export const mealRelationSchema = z.enum(["before", "after", "unsure", "not_specified"]);

export const tummyEntryInputSchema = z.object({
  occurredAt: z.date(),
  timezone: z.string().min(1).max(100),
  intensity: z.number().int().min(0).max(10),
  symptoms: z.array(symptomSchema).min(1).max(symptomValues.length),
  location: locationSchema.optional(),
  durationMinutes: z.number().int().min(1).max(10_080).optional(),
  mealRelation: mealRelationSchema.optional(),
  moodOrEnergy: z.string().trim().min(1).max(40).optional(),
  note: z.string().trim().min(1).max(500).optional(),
});

export const tummyEntrySchema = tummyEntryInputSchema.extend({ id: z.string().min(1).max(100) });

export type Symptom = z.infer<typeof symptomSchema>;
export type TummyLocation = z.infer<typeof locationSchema>;
export type MealRelation = z.infer<typeof mealRelationSchema>;
export type TummyEntryInput = z.input<typeof tummyEntryInputSchema>;
export type TummyEntry = z.output<typeof tummyEntrySchema>;

export const symptomLabels: Record<Symptom, string> = {
  pain_cramp: "နာကျင်ခြင်း / အောင့်ခြင်း",
  bloating: "ဗိုက်ဖောင်းခြင်း",
  nausea: "ပျို့အန်ချင်ခြင်း",
  heartburn: "ရင်ပူခြင်း",
  diarrhea: "ဝမ်းလျှောခြင်း",
  constipation: "ဝမ်းချုပ်ခြင်း",
  gas: "လေပွခြင်း",
  other: "အခြား",
};

export const locationLabels: Record<TummyLocation, string> = {
  upper: "အပေါ်ပိုင်း",
  lower: "အောက်ပိုင်း",
  left: "ဘယ်ဘက်",
  right: "ညာဘက်",
  all_over: "တစ်ဝိုက်လုံး",
  unsure: "မသေချာပါ",
};

export const mealRelationLabels: Record<MealRelation, string> = {
  before: "မစားခင်",
  after: "စားပြီးနောက်",
  unsure: "မသေချာပါ",
  not_specified: "မသတ်မှတ်ထားပါ",
};
