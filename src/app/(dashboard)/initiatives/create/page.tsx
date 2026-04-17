"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { api } from "@/lib/api/client";
import { TSHIRT_SIZES, DURATION_OPTIONS } from "@/lib/types/initiative";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const WORKSTREAM_OPTIONS = [
  { value: "1", label: "Digital Transformation" },
  { value: "2", label: "Operational Excellence" },
  { value: "3", label: "Customer Experience" },
  { value: "4", label: "Sustainability" },
];

const STRATEGIC_OBJECTIVE_OPTIONS = [
  { value: "1", label: "Increase Revenue 15%" },
  { value: "2", label: "Reduce Operational Costs" },
  { value: "3", label: "Improve Customer Satisfaction" },
  { value: "4", label: "Accelerate Digital Adoption" },
  { value: "5", label: "Enhance Sustainability" },
];

const LEAD_OPTIONS = [
  { value: "1", label: "Maria Garcia" },
  { value: "2", label: "Carlos Rodriguez" },
  { value: "3", label: "Ana Martinez" },
  { value: "4", label: "Pedro Lopez" },
  { value: "5", label: "Sofia Chen" },
];

interface FormErrors {
  name?: string;
  description?: string;
  workstream?: string;
  tshirt_size?: string;
  estimated_duration?: string;
  lead?: string;
}

export default function CreateInitiativePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workstream, setWorkstream] = useState("");
  const [strategicObjective, setStrategicObjective] = useState("");
  const [tshirtSize, setTshirtSize] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [lead, setLead] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): FormErrors {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!workstream) newErrors.workstream = "Workstream is required";
    if (!tshirtSize) newErrors.tshirt_size = "T-shirt size is required";
    if (!estimatedDuration)
      newErrors.estimated_duration = "Estimated duration is required";
    if (!lead) newErrors.lead = "Lead is required";
    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      workstream: Number(workstream),
      strategic_objective: strategicObjective
        ? Number(strategicObjective)
        : null,
      tshirt_size: tshirtSize,
      estimated_duration: estimatedDuration,
      lead: Number(lead),
    };

    try {
      await api.post("/initiatives/", payload);
    } catch {
      // API not available — fall through to redirect
    }

    router.push("/initiatives");
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 py-6">
      {/* Header */}
      <div className="space-y-1">
        <Link
          href="/initiatives"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All Initiatives
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          Create New Initiative
        </h1>
        <p className="text-sm text-muted-foreground">
          Fill in the details to create a new strategic initiative
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Initiative Details</CardTitle>
            <CardDescription>
              Fields marked with * are required
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Basic Information
              </h3>

              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter initiative name"
                  maxLength={200}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the initiative and its expected impact"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  aria-invalid={!!errors.description}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Section 2: Classification */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Classification
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Workstream *</Label>
                  <Select
                    value={workstream}
                    onValueChange={(v) => setWorkstream(v ?? "")}
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={!!errors.workstream}
                    >
                      <SelectValue placeholder="Select workstream" />
                    </SelectTrigger>
                    <SelectContent>
                      {WORKSTREAM_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.workstream && (
                    <p className="text-xs text-destructive">
                      {errors.workstream}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Strategic Objective</Label>
                  <Select
                    value={strategicObjective}
                    onValueChange={(v) => setStrategicObjective(v ?? "")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select objective" />
                    </SelectTrigger>
                    <SelectContent>
                      {STRATEGIC_OBJECTIVE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>T-shirt Size *</Label>
                  <Select
                    value={tshirtSize}
                    onValueChange={(v) => setTshirtSize(v ?? "")}
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={!!errors.tshirt_size}
                    >
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {TSHIRT_SIZES.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tshirt_size && (
                    <p className="text-xs text-destructive">
                      {errors.tshirt_size}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Estimated Duration *</Label>
                  <Select
                    value={estimatedDuration}
                    onValueChange={(v) => setEstimatedDuration(v ?? "")}
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={!!errors.estimated_duration}
                    >
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.estimated_duration && (
                    <p className="text-xs text-destructive">
                      {errors.estimated_duration}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 3: Ownership */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Ownership
              </h3>

              <div className="max-w-xs space-y-2">
                <Label>Lead *</Label>
                <Select
                  value={lead}
                  onValueChange={(v) => setLead(v ?? "")}
                >
                  <SelectTrigger
                    className="w-full"
                    aria-invalid={!!errors.lead}
                  >
                    <SelectValue placeholder="Select lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.lead && (
                  <p className="text-xs text-destructive">{errors.lead}</p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/initiatives")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Initiative"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
