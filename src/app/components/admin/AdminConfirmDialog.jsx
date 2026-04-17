"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Loader2 } from "lucide-react";

/**
 * AdminConfirmDialog - A reusable confirmation modal for dangerous actions.
 * 
 * @param {boolean} isOpen - Whether the dialog is visible.
 * @param {function} onOpenChange - Callback when visibility changes.
 * @param {string} title - The main heading of the dialog.
 * @param {string} description - The explanatory text.
 * @param {string} confirmText - Label for the confirm button.
 * @param {string} cancelText - Label for the cancel button.
 * @param {function} onConfirm - Callback when user confirms.
 * @param {string} variant - 'destructive' or 'default'.
 * @param {boolean} isLoading - Shows loading state on confirm button.
 * @param {React.ReactNode} children - Optional extra content (e.g. lists).
 */
export function AdminConfirmDialog({
  isOpen,
  onOpenChange,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  variant = "destructive",
  isLoading = false,
  children,
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-slate-900">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-600 mt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {children && (
          <div className="my-4 py-2 border-y border-slate-100 max-h-[300px] overflow-y-auto">
            {children}
          </div>
        )}

        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel disabled={isLoading} className="rounded-xl">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={`rounded-xl px-6 ${
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-teal-600 hover:bg-teal-700 text-white"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
