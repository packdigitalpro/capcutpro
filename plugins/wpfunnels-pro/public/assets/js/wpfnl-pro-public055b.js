(function ($) {
    "use strict";

    /**
     * All of the code for your public-facing JavaScript source
     * should reside in this file.
     *
     * Note: It has been assumed you will write jQuery code here, so the
     * $ function reference has been prepared for usage within the scope
     * of this function.
     *
     * This enables you to define handlers, for when the DOM is ready:
     *
     * $(function() {
     *
     * });
     *
     * When the window is loaded:
     *
     * $( window ).load(function() {
     *
     * });
     *
     * ...and/or other possibilities.
     *
     * Ideally, it is not considered best practise to attach more than a
     * single DOM-ready or window-load handler for a particular page.
     * Although scripts in the WordPress core, Plugins and Themes may be
     * practising this, we should strive to set a better example in our own work.
     */

    /**
     * process offer order
     *
     * @param data
     */
    var wpfunnels_process_offer = function (data) {
        var ajaxurl = wpfnl_obj.ajaxurl;
        $.ajax({
            type: "POST",
            url: ajaxurl,
            data: data,
            success: function (response) {
                $(".wpfunnels-offer-loader p.description").text(response.message);
                if (response.status === "success") {
                    $("#wpfnl-alert-accept").addClass("wpfnl-success");
                    if (response.redirect_url != undefined) {
                        setTimeout(function () {
                            $(".wpfunnels-offer-loader p.description").text("Redirecting...");
                            window.location.href = response.redirect_url;
                        }, 1000);
                    }
                } else {
                    $(".wpfunnels-offer-loader p.description").text(response.message);
                    setTimeout(function () {
                        $(".wpfunnels-offer-loader").hide();
                    }, 1500);
                }
            },
        });
    };

    /**
     * get query param from url
     *
     * @param sParam
     * @returns {boolean|string}
     */
    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split("&"),
            sParameterName,
            i;
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split("=");

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    }

    function wpfunnels_capture_woocommerce_paypal_order() {
        if ("undefined" !== typeof window.WPFunnelsOfferVars) {
            if ("upsell" === window.WPFunnelsOfferVars.offer_type || "downsell" === window.WPFunnelsOfferVars.offer_type) {
                var is_paypal_return = getUrlParameter("wpfnl-paypal-return"),
                    security = "";

                if (is_paypal_return) {
                    security = window.WPFunnelsOfferVars.wpfnl_capture_paypal_order_nonce;
                    var ajax_data = {
                        order_id: window.WPFunnelsOfferVars.order_id,
                        step_id: window.WPFunnelsOfferVars.step_id,
                        action: "wpfnl_capture_paypal_order",
                        step_type: window.WPFunnelsOfferVars.offer_type,
                        security: security,
                    };
                    $(".wpfunnels-offer-loader").show();
                    $.ajax({
                        url: window.WPFunnelsOfferVars.ajaxUrl,
                        data: ajax_data,
                        dataType: "json",
                        type: "POST",
                        success: function (response) {
                            var ajax_data = {
                                action: "",
                                step_id: window.WPFunnelsOfferVars.step_id,
                                funnel_id: window.WPFunnelsOfferVars.funnel_id,
                                order_id: window.WPFunnelsOfferVars.order_id,
                                order_key: window.WPFunnelsOfferVars.order_key,
                                offer_type: window.WPFunnelsOfferVars.offer_type,
                                offer_action: "yes",
                                product_id: window.WPFunnelsOfferVars.product_id,
                                quantity: window.WPFunnelsOfferVars.quantity,
                                attr: "",
                                is_variable: window.WPFunnelsOfferVars.is_variable,
                            };
                            if (window.WPFunnelsOfferVars.is_variable) {
                                ajax_data.variation_id = getUrlParameter("wpfnl-variation-id");
                            }

                            var offer_type = window.WPFunnelsOfferVars.offer_type;
                            if ("upsell" === ajax_data.offer_type) {
                                ajax_data.action = "wpfnl_" + offer_type + "_accepted";
                                ajax_data.security = window.WPFunnelsOfferVars.wpfnl_upsell_accepted_nonce;
                            } else if ("downsell" === ajax_data.offer_type) {
                                ajax_data.action = "wpfnl_" + offer_type + "_accepted";
                                ajax_data.security = window.WPFunnelsOfferVars.wpfnl_downsell_accepted_nonce;
                            }

                            wpfunnels_process_offer(ajax_data);
                        },
                    });
                }
            }
        }
    }

    /**
     * capture mollie payment from url
     */
    var wpfunnels_capture_woocommerce_mollie_order = function () {
        let is_mollie_return = getUrlParameter("wpfnl-mollie-return"),
            nonce = "";

        if (is_mollie_return) {
            var offer_type = window.WPFunnelsOfferVars.offer_type;
            var ajax_data = {
                action: "",
                step_id: window.WPFunnelsOfferVars.step_id,
                funnel_id: window.WPFunnelsOfferVars.funnel_id,
                order_id: window.WPFunnelsOfferVars.order_id,
                order_key: window.WPFunnelsOfferVars.order_key,
                offer_type: window.WPFunnelsOfferVars.offer_type,
                offer_action: "yes",
                product_id: window.WPFunnelsOfferVars.product_id,
                quantity: window.WPFunnelsOfferVars.quantity,
                security: nonce,
            };
            if ("upsell" === offer_type) {
                ajax_data.action = "wpfnl_" + offer_type + "_accepted";
                ajax_data.security = window.WPFunnelsOfferVars.wpfnl_upsell_accepted_nonce;
            } else if ("downsell" === offer_type) {
                ajax_data.action = "wpfnl_" + offer_type + "_accepted";
                ajax_data.security = window.WPFunnelsOfferVars.wpfnl_downsell_accepted_nonce;
            }
            $(".wpfunnels-offer-loader").show();
            wpfunnels_process_offer(ajax_data);
        }
    };

    /**
     * process mollie payment with
     * ajax
     *
     * @param ajax_data
     * @param gateway
     */
    function wpfunnels_process_mollie_payments(ajax_data, gateway) {
        if ("mollie_wc_gateway_creditcard" === gateway) {
            ajax_data.action = "wpf_mollie_credit_card_payment_process";
            ajax_data.security = window.WPFunnelsOfferVars.wpfnl_mollie_cc_process_nonce;
        } else if ("mollie_wc_gateway_creditcard" === gateway) {
            ajax_data.action = "wpf_mollie_ideal_payment_process";
            ajax_data.security = window.WPFunnelsOfferVars.wpfnl_mollie_ideal_process_nonce;
        }

        $.ajax({
            url: window.WPFunnelsOfferVars.ajaxUrl,
            data: ajax_data,
            dataType: "json",
            type: "POST",
            success: function (response) {
                if ("success" === response.result) {
                    window.location.href = response.redirect;
                }
            },
        });
    }

    /**
     * create paypal order for WC paypal
     * @param ajax_data
     */
    function wpfunnels_create_paypal_order(ajax_data) {
        $.ajax({
            url: window.WPFunnelsOfferVars.ajaxUrl,
            data: ajax_data,
            dataType: "json",
            type: "POST",
            success: function (response) {
                if ("success" === response.status) {
                    window.location.href = response.redirect;
                } else {
                    ajax_data.action = "wpfnl_" + ajax_data.offer_type + "_accepted";
                    if ("upsell" === ajax_data.offer_type) {
                        ajax_data.security = window.WPFunnelsOfferVars.wpfnl_upsell_accepted_nonce;
                    } else if ("downsell" === ajax_data.offer_type) {
                        ajax_data.security = window.WPFunnelsOfferVars.wpfnl_downsell_accepted_nonce;
                    }
                    wpfunnels_process_offer(ajax_data);
                }
            },
        });
    }

    /**
     * Get selected variation
     *
     * @returns Object
     */
    function getSelectedVariationID() {
        let attr = {},
            is_empty = false;

        $(".wpfnl-variable-attribute-offer").each(function (index) {
            if ($(this).val()) {
                attr["attribute_" + $(this).attr("id")] = $(this).val();
            } else {
                is_empty = true;
            }
        });
        let response = {
            is_empty: is_empty,
            attr: attr,
        };
        return response;
    }

    $(".wpfnl-variable-attribute-offer").change(function () {
        let response = getSelectedVariationID();
        if (!response.is_empty) {
            let payload = {
                product_id: window.WPFunnelsOfferVars.product_id,
                attr: response.attr,
            };

            $(".offer-btn-loader").show();

            wpAjaxHelperRequest("wpfnl-get-variation-price", payload)
                .success(function (response) {
                    if (response.success) {
                        $("#wpfnl-offer-product-price").empty();
                        $("#wpfnl-offer-product-price").html(response.data);
                        $(".offer-btn-loader").hide();
                    }
                })
                .error(function (response) {});
        } else {
            $("#wpfnl-offer-product-price").empty();
        }
    });

    /**
     * offer action ajax
     */
    $(document).on("click", ".wpfunnels_offer_button, .wpfunnels-block-offer-button", function (e) {
        e.preventDefault();
        $(".wpfnl-select-variation").text("");
        let ajaxurl = window.WPFunnelsOfferVars.ajaxUrl,
            step_id = window.WPFunnelsOfferVars.step_id,
            funnel_id = window.WPFunnelsOfferVars.funnel_id,
            is_lms = window.WPFunnelsOfferVars.is_lms,
            order_id = window.WPFunnelsOfferVars.order_id,
            order_key = window.WPFunnelsOfferVars.order_key,
            product_id = window.WPFunnelsOfferVars.product_id,
            quantity = window.WPFunnelsOfferVars.quantity,
            payment_method = window.WPFunnelsOfferVars.payment_method,
            skip_offer = window.WPFunnelsOfferVars.skip_offer,
            id = $(this).attr("id"),
            offer_action = "yes",
            offer_type = "upsell",
            action = "wpfnl_upsell_accept",
            security = "",
            products = $(this).attr("data-products"),
            next_step = $(this).attr("data-next-step");
        let response = getSelectedVariationID();

        /**
         * check if upsell accepted or rejected
         */
        if (id.indexOf("wpfunnels_upsell") !== -1) {
            offer_type = "upsell";
            if (id.indexOf("wpfunnels_upsell_accept") !== -1) {
                offer_action = "yes";
                security = window.WPFunnelsOfferVars.wpfnl_upsell_accepted_nonce;
            } else {
                offer_action = "no";
                security = window.WPFunnelsOfferVars.wpfnl_upsell_rejected_nonce;
            }
        }

        /**
         * check if downsell accepted or rejected
         */
        if (id.indexOf("wpfunnels_downsell") !== -1) {
            offer_type = "downsell";
            if (id.indexOf("wpfunnels_downsell_accept") !== -1) {
                offer_action = "yes";
                security = window.WPFunnelsOfferVars.wpfnl_downsell_accepted_nonce;
            } else {
                offer_action = "no";
                security = window.WPFunnelsOfferVars.wpfnl_downsell_rejected_nonce;
            }
        }

        /**
         * define action of ajax
         */
        if ("yes" === offer_action) {
            action = "wpfnl_" + offer_type + "_accepted";
            $(".wpfunnels-offer-loader p.description").text("Please wait while processing your order");
        } else {
            action = "wpfnl_" + offer_type + "_rejected";
            $(".wpfunnels-offer-loader p.description").text("Please wait...");
        }
        if ("yes" === skip_offer && "yes" === offer_action) {
            return false;
        }

        if (offer_action == "yes" && response.is_empty && window.WPFunnelsOfferVars.is_variable) {
            $(".wpfnl-select-variation").text("Please select the variation");
            return false;
        }

        $(".wpfunnels-offer-loader").show();

        if (is_lms === "yes" || (undefined !== order_id && undefined !== order_key)) {
            var ajax_data = {
                action: action,
                step_id: step_id,
                funnel_id: funnel_id,
                order_id: order_id,
                order_key: order_key,
                offer_type: offer_type,
                offer_action: offer_action,
                products: products,
                product_id: product_id,
                quantity: quantity,
                next_step: next_step,
                stripe_sca_payment: false,
                stripe_intent_id: "",
                woop_intent_id: "",
                attr: "",
                is_variable: window.WPFunnelsOfferVars.is_variable,
            };
            if ("yes" === offer_action) {
                if (window.WPFunnelsOfferVars.is_variable) {
                    ajax_data.attr = response.attr;
                }

                if ("stripe" === window.WPFunnelsOfferVars.payment_gateway) {
                    ajax_data.security = window.WPFunnelsOfferVars.wpfnl_stripe_sca_check_nonce;
                    ajax_data.action = "wpfunnels_stripe_sca_check";
                    $.ajax({
                        type: "POST",
                        url: ajaxurl,
                        data: ajax_data,
                        success: function (response) {
                            if (response.hasOwnProperty("intent_secret")) {
                                var stripe = Stripe(response.stripe_pk);
                                stripe
                                    .handleCardPayment(response.intent_secret)
                                    .then(function (response) {
                                        if (response.error) {
                                            throw response.error;
                                        }
                                        if ("requires_capture" !== response.paymentIntent.status && "succeeded" !== response.paymentIntent.status) {
                                            return;
                                        }

                                        ajax_data.action = action;
                                        ajax_data.stripe_sca_payment = true;
                                        ajax_data.security = security;
                                        ajax_data.stripe_intent_id = response.paymentIntent.id;
                                        wpfunnels_process_offer(ajax_data);
                                    })
                                    .catch(function (error) {
                                        window.location.reload();
                                    });
                            } else {
                                ajax_data.action = action;
                                ajax_data.security = security;

                                wpfunnels_process_offer(ajax_data);
                            }
                        },
                    });
                } else if ("woocommerce_payments" === window.WPFunnelsOfferVars.payment_gateway) {
                    ajax_data.security = window.WPFunnelsOfferVars.wpfunnels_woop_create_payment_intent;
                    ajax_data.action = "wpfunnels_woop_create_payment_intent";

                    $.ajax({
                        url: ajaxurl,
                        data: ajax_data,
                        dataType: "json",
                        type: "POST",
                        success(response) {
                            if (response.hasOwnProperty("client_secret") && "" !== response.client_secret && "succeeded" !== response.status) {
                                const stripe = Stripe(response.client_public);

                                stripe
                                    .confirmCardPayment(response.client_secret)
                                    .then(function (resp) {
                                        if (resp.error) {
                                            throw resp.error;
                                        }

                                        if ("requires_capture" !== resp.paymentIntent.status && "succeeded" !== resp.paymentIntent.status) {
                                            console.log("Order not complete. Received status: " + resp.paymentIntent.status);
                                            return;
                                        }

                                        ajax_data.action = action;
                                        ajax_data.woop_intent_id = resp.paymentIntent.id;
                                        ajax_data.woop_payment_method = resp.paymentIntent.payment_method;
                                        wpfunnels_process_offer(ajax_data);
                                    })
                                    .catch(function () {
                                        window.location.reload();
                                    });
                            } else {
                                ajax_data.action = action;
                                ajax_data.security = security;
                                ajax_data.woop_intent_id = response.client_intend;
                                wpfunnels_process_offer(ajax_data);
                            }
                        },
                    });
                } else if ("mollie_wc_gateway_creditcard" === window.WPFunnelsOfferVars.payment_gateway) {
                    wpfunnels_process_mollie_payments(ajax_data, window.WPFunnelsOfferVars.payment_gateway);
                } else if ("mollie_wc_gateway_ideal" === window.WPFunnelsOfferVars.payment_gateway) {
                    wpfunnels_process_mollie_payments(ajax_data, window.WPFunnelsOfferVars.payment_gateway);
                } else if ("ppcp-gateway" === window.WPFunnelsOfferVars.payment_gateway) {
                    ajax_data.security = window.WPFunnelsOfferVars.wpfnl_create_paypal_order_nonce;
                    ajax_data.action = "wpfnl_create_paypal_order";
                    wpfunnels_create_paypal_order(ajax_data);
                } else {
                    ajax_data.security = security;

                    wpfunnels_process_offer(ajax_data);
                }
            } else {
                ajax_data.action = action;
                ajax_data.security = security;
                wpfunnels_process_offer(ajax_data);
            }
        } else {
            $("#wpfnl-loader-accept").hide();
            $("#wpfnl-alert-accept").addClass("wpfnl-error");
            $("#wpfnl-alert-accept").text("No order found to process");
        }
    });

    //=== Upsell Reject ajax called==//
    $(document).on("click", "#wpfunnels_upsell_reject", function (e) {
        e.preventDefault();
        $("#wpfnl-loader-reject").css("display", "inline-block");
        $("#wpfnl-alert-reject").show();
        var ajaxurl = wpfnl_obj.ajaxurl;
        var step_id = $(this).attr("data-id");
        var order_id = getUrlParameter("order_id");
        var order_key = getUrlParameter("order_key");
        var next_step = $(this).attr("data-next-step");
        if (order_id != undefined && order_key != undefined) {
            jQuery.ajax({
                type: "POST",
                url: ajaxurl,
                data: {
                    action: "wpfnl_upsell_reject_ajax",
                    step_id: step_id,
                    order_id: order_id,
                    next_step: next_step,
                    order_key: order_key,
                },
                success: function (response) {
                    $("#wpfnl-loader-reject").hide();
                    setTimeout(function () {
                        window.location.href = response.redirect_url;
                    }, 500);
                },
            });
        } else {
            $("#wpfnl-loader-reject").hide();
            $("#wpfnl-alert-reject").addClass("wpfnl-error");
            $("#wpfnl-alert-reject").text("No order found to process");
        }
    });

    wpfunnels_capture_woocommerce_paypal_order();
    wpfunnels_capture_woocommerce_mollie_order();

    /**
     * facebook pixel for order bump added to
     * cart
     */
    var wpfunnels_facebook_pixel = function () {
        jQuery(document).ajaxComplete(function (event, xhr, settings) {
            if (!xhr.hasOwnProperty("responseJSON")) {
                return;
            }

            let fragments = xhr.responseJSON.hasOwnProperty("fragments") ? xhr.responseJSON.fragments : null;
            if (fragments && fragments.hasOwnProperty("product_added_to_cart")) {
                fbq("track", "AddToCart", fragments.product_added_to_cart.product_added_to_cart);
            }
        });
    };

    //== Variable product and single product add in checkout page ==//
    $(document).ready(function () {
        $(document).on("change", ".wpfnl-product-variation .input-checkbox", function (e) {
            e.preventDefault();
            var ajaxurl = window.wpfnl_obj.ajaxurl;
            var step_id = window.wpfnl_obj.step_id;
            var product_id = $(this).parent().data("id");
            // var quantity = $(this).parent().data('qty');
            var quantity = $(this).parent().parent().parent().parent().parent().find(".set-quantity").val();
            let checker = false;
            if (quantity == undefined) {
                var quantity = $(this).parent().data("qty");
            }
            if ($(this).prop("checked") == true) {
                checker = true;
            } else if ($(this).prop("checked") == false) {
                checker = false;
            }

            jQuery.ajax({
                type: "POST",
                url: ajaxurl,
                data: {
                    action: "wpfnl_variable_ajax",
                    checker: checker,
                    quantity: quantity,
                    step_id: step_id,
                    product_id: product_id,
                    type: "checkbox",
                },
                success: function (response) {
                    if (response.success) {
                        if (response.data.status == "success") {
                            $("body").trigger("update_checkout");
                        } else {
                            console.log(response);
                        }
                    } else {
                        console.log(response);
                    }
                },
            });
        });

        $(document).on("change keyup", ".product-quantity .set-quantity", function (e) {
            e.preventDefault();
            var ajaxurl = window.wpfnl_obj.ajaxurl;
            var step_id = window.wpfnl_obj.step_id;
            var product_id = $(this).attr("product-id");
            var quantity = $(this).val();
            if (quantity < 1) {
                return false;
            }
            let checker = false;
            let isQuantity = true;
            if ($(this).parent().parent().find(".input-checkbox").prop("checked") == undefined) {
                if ($(this).parent().parent().find(".input-radio").prop("checked") == true) {
                    checker = true;
                } else if ($(this).parent().parent().find(".input-radio").prop("checked") == false) {
                    checker = false;
                    return false;
                }
            }
            if ($(this).parent().parent().find(".input-radio").prop("checked") == undefined) {
                if ($(this).parent().parent().find(".input-checkbox").prop("checked") == true) {
                    checker = true;
                } else if ($(this).parent().parent().find(".input-checkbox").prop("checked") == false) {
                    checker = false;
                    return false;
                }
            }
            jQuery.ajax({
                type: "POST",
                url: ajaxurl,
                data: {
                    action: "wpfnl_variable_ajax",
                    checker: checker,
                    quantity: quantity,
                    step_id: step_id,
                    product_id: product_id,
                    isQuantity: isQuantity,
                    type: "checkbox",
                },
                success: function (response) {
                    if (response.success) {
                        if (response.data.status == "success") {
                            $("body").trigger("update_checkout");
                        } else {
                            console.log(response);
                        }
                    } else {
                        console.log(response);
                    }
                },
            });
        });

        $(document).on("change keyup", ".single-product .product-quantity .set-quantity-single", function (e) {
            e.preventDefault();
            var ajaxurl = window.wpfnl_obj.ajaxurl;
            var step_id = window.wpfnl_obj.step_id;
            var product_id = $(this).attr("product-id");
            var quantity = $(this).val();
            if (quantity < 1) {
                return false;
            }
            let isQuantity = true;
            jQuery.ajax({
                type: "POST",
                url: ajaxurl,
                data: {
                    action: "wpfnl_single_product_quantity_ajax",
                    quantity: quantity,
                    step_id: step_id,
                    product_id: product_id,
                    isQuantity: isQuantity,
                },
                success: function (response) {
                    if (response.success) {
                        if (response.data.status == "success") {
                            $("body").trigger("update_checkout");
                        } else {
                            console.log(response);
                        }
                    } else {
                        console.log(response);
                    }
                },
            });
        });

        $(document).on("change", ".wpfnl-product-variation .input-radio", function (e) {
            e.preventDefault();
            var ajaxurl = window.wpfnl_obj.ajaxurl;
            var step_id = window.wpfnl_obj.step_id;
            var product_id = $(this).data("id");
            var quantity = $(this).parent().parent().parent().parent().find(".set-quantity").val();
            if (quantity == undefined) {
                var quantity = $(this).parent().data("qty");
            }
            let checker = true;
            if (quantity < 1) {
                return false;
            }
            if ($(this).prop("checked") == true) {
                checker = true;
            } else if ($(this).prop("checked") == false) {
                checker = false;
            }

            jQuery.ajax({
                type: "POST",
                url: ajaxurl,
                data: {
                    action: "wpfnl_variable_ajax",
                    checker: checker,
                    quantity: quantity,
                    step_id: step_id,
                    product_id: product_id,
                    type: "radio",
                },
                success: function (response) {
                    if (response.success) {
                        if (response.data.status == "success") {
                            $("body").trigger("update_checkout");
                        } else {
                            console.log(response);
                        }
                    } else {
                        console.log(response);
                    }
                },
            });
        });

        $(document).on("change", ".wpfnl-variation", function (e) {
            e.preventDefault();
            let ajaxurl = window.wpfnl_obj.ajaxurl,
                step_id = window.wpfnl_obj.step_id,
                attrs = [],
                quantity = $(this).parents(".offer-variation-wrapper").find(".wpfnl-varition-qty").val(),
                product_id = $(this).parents(".offer-variation-wrapper").find(".wpfnl-product-id").val(),
                load_ajax = true;

            $(this)
                .parents(".offer-variation-wrapper")
                .find(".wpfnl-variable-attribute-offer")
                .each(function () {
                    var title = $(this).attr("id");
                    var value = $(this).val();
                    if (value) {
                        attrs.push({ [title]: value });
                    } else {
                        load_ajax = false;
                    }
                });
            
            if (load_ajax) {
                $("input[name='_wpfunnels_variable_product']").val('selected');
                jQuery.ajax({
                    type: "POST",
                    url: ajaxurl,
                    data: {
                        action: "wpfnl_update_variable_ajax",
                        quantity: quantity,
                        step_id: step_id,
                        product_id: product_id,
                        attrs: attrs,
                    },
                    success: function (response) {
                        if (response.success) {
                            if (response.data.status == "success") {
                                $("body").trigger("update_checkout");
                            }
                        } else {
                            console.log(response);
                        }
                    },
                });
            }else{
                $("input[name='_wpfunnels_variable_product']").val('unselected');
            }
        });

        $(document).on("keyup change", ".wpfnl-quantity-setect", function (e) {
            e.preventDefault();
            var ajaxurl = window.wpfnl_obj.ajaxurl;
            var step_id = window.wpfnl_obj.step_id;
            var product_id = $(this).data("product-id");
            var variation_id = $(this).data("variation-id");
            var variation = $(this).data("variation");
            var quantity = $(this).val();

            if (!quantity) {
                return false;
            }
            if (quantity < 1) {
                quantity = 1;
            }

            let that = this;
            jQuery.ajax({
                type: "POST",
                url: ajaxurl,
                data: {
                    action: "wpfnl_update_quantity_ajax",
                    quantity: quantity,
                    step_id: step_id,
                    product_id: product_id,
                    variation_id: variation_id,
                    variation: variation,
                },
                success: function (response) {
                    if (response.success) {
                        $(that).val(quantity);
                        if (response.data.status == "success") {
                            $("body").trigger("update_checkout");
                        }
                    }
                },
            });
        });

        if ("1" !== window?.wpfnl_obj?.is_builder_preview) {
            wpfunnels_facebook_pixel();
        }
    });

    // trigger ajax if any user abandon the funnel
    var doAjaxBeforeUnloadEnabled = true;
    var doAjaxBeforeUnload = function (evt) {
        if (!doAjaxBeforeUnloadEnabled) {
            return;
        }
        doAjaxBeforeUnloadEnabled = false;
        var ajaxurl = window.wpfnl_obj.ajaxurl;
        jQuery.ajax({
            type: "POST",
            url: ajaxurl,
            data: {
                action: "maybe_abandoned_funnel",
                funnel_id: window.wpfnl_obj.funnel_id,
                step_id: window.wpfnl_obj.step_id,
                security: window.wpfnl_obj.abandoned_ajax_nonce,
            },
            success: function (response) {},
        });
    };

    $(document).ready(function () {
        window.onbeforeunload = doAjaxBeforeUnload;
        // $(window).on("unload", doAjaxBeforeUnload);
        // $(window).unload(doAjaxBeforeUnload);
    });
})(jQuery);
