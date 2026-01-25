"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, CreditCard, Plus } from "lucide-react";
import { toast } from "sonner";
import { useWallet, StripeCard } from "@/hooks/useWallet";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CouponPaymentCard from "@/components/CouponPaymentCard";
import { AddCardModal } from "@/components/payment/AddCardModal";

interface RechargeWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  onRechargeComplete: () => void;
}

/**
 * RechargeWalletModal Component
 * Displays available Stripe cards and allows adding new cards for wallet recharge
 */
export function RechargeWalletModal({
  isOpen,
  onClose,
  amount,
  onRechargeComplete
}: RechargeWalletModalProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | number | null>(null);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    balance,
    stripeCards,
    isStripeEnabled,
    stripePublishableKey,
    isLoading,
    refetch,
  } = useWallet();

  const wasOpen = React.useRef(false);

  // Refresh payment details when modal opens
  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      refetch();
      setSelectedCardId(null);
      setIsAddCardModalOpen(false);
    }
    wasOpen.current = isOpen;
  }, [isOpen, refetch]);

  const handleRecharge = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!selectedCardId) {
      toast.error('Please select a card to proceed');
      return;
    }

    try {
      setIsProcessing(true);
      toast.loading('Processing recharge...', { id: 'wallet-recharge' });

      // TODO: Implement actual wallet recharge API call here
      // Example:
      // await rechargeWallet({
      //   amount: parseFloat(amount),
      //   cardId: selectedCardId,
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Wallet recharged successfully!', { id: 'wallet-recharge' });
      onRechargeComplete();
      onClose();
    } catch (error: any) {
      console.error('❌ Wallet recharge failed:', error);
      toast.error(error.message || 'Failed to recharge wallet', { id: 'wallet-recharge' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const rechargeAmount = parseFloat(amount) || 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          showCloseButton={false}
          className="max-w-md w-full p-0 gap-0 border-none overflow-hidden bg-white rounded-2xl"
        >
          <DialogTitle className="sr-only">Recharge Wallet</DialogTitle>

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary to-primary-light text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Recharge Wallet</h2>
                <p className="text-sm text-white/80 mt-1">
                  Amount: ${rechargeAmount.toFixed(2)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-gray-500">Loading payment methods...</p>
              </div>
            ) : !isStripeEnabled ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Card payments are not available in your area</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Select Payment Method
                </h3>

                {/* Existing Stripe Cards */}
                {stripeCards ? (
                  stripeCards.map((card: StripeCard) => {
                    const selected = selectedCardId === card.id;
                    return (
                      <CouponPaymentCard
                        key={card.id}
                        imgUrl={`/images/cards/${card.brand.toLowerCase()}.png`}
                        title={`${card.brand} •••• ${card.last_4}`}
                        subtitle={`Expires ${card.exp_month}/${card.exp_year}`}
                        selected={selected}
                        onClick={() => setSelectedCardId(card.id)}
                      />
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No saved cards found
                  </p>
                )}

                {/* Add New Card Button */}
                <button
                  onClick={() => setIsAddCardModalOpen(true)}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-primary"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Add New Card</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          {isStripeEnabled && (
            <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRecharge}
                disabled={isProcessing || !selectedCardId || rechargeAmount <= 0}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    Recharge ${rechargeAmount.toFixed(2)}
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Card Modal */}
      {stripePublishableKey && (
        <AddCardModal
          isOpen={isAddCardModalOpen}
          onClose={() => setIsAddCardModalOpen(false)}
          onCardAdded={() => {
            refetch();
            toast.success('Card added successfully! You can now select it for payment.');
            setIsAddCardModalOpen(false);
          }}
          stripePublishableKey={stripePublishableKey}
        />
      )}
    </>
  );
}
