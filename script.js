export default {

  async fetch(request, env) {

    /* =====================================================
       CORS
    ===================================================== */

    const corsHeaders = {

      "Access-Control-Allow-Origin": "*",

      "Access-Control-Allow-Methods":
        "POST, OPTIONS",

      "Access-Control-Allow-Headers":
        "Content-Type"

    };


    /* =====================================================
       PREFLIGHT
    ===================================================== */

    if (
      request.method === "OPTIONS"
    ) {

      return new Response(null, {

        status: 204,

        headers: corsHeaders

      });

    }


    /* =====================================================
       ONLY POST
    ===================================================== */

    if (
      request.method !== "POST"
    ) {

      return new Response(
        "Method Not Allowed",
        {
          status: 405,
          headers: corsHeaders
        }
      );

    }


    try {

      /* ===================================================
         READ REQUEST
      =================================================== */

      const body =
        await request.text();


      let data;


      try {

        data =
          JSON.parse(body);

      } catch {

        return new Response(
          "Invalid JSON",
          {
            status: 400,
            headers: corsHeaders
          }
        );

      }


      /* ===================================================
         WEBSITE PAYMENT ATTEMPT
      =================================================== */

      if (
        data.type ===
        "payment_attempt"
      ) {

        const email =
          data.email ||
          "Not provided";


        const tier =
          data.tier ||
          "Unknown";


        const method =
          data.method ||
          "Unknown";


        const discordPayload = {

          username:
            "FuturesMove Payments",


          embeds: [

            {

              title:
                "💳 NEW PAYMENT ATTEMPT",


              description:
                "A visitor has started the VIP payment process.",


              fields: [

                {

                  name:
                    "📧 Email",

                  value:
                    email,

                  inline: true

                },


                {

                  name:
                    "🏷️ Tier",

                  value:
                    tier,

                  inline: true

                },


                {

                  name:
                    "💰 Method",

                  value:
                    method,

                  inline: true

                },


                {

                  name:
                    "⏳ Status",

                  value:
                    "Waiting for payment verification",

                  inline: false

                }

              ],


              footer: {

                text:
                  "Check Copperx before granting VIP access."

              },


              timestamp:
                new Date().toISOString()

            }

          ]

        };


        /* ===============================================
           SEND ATTEMPT TO DISCORD
        =============================================== */

        const discordResponse =
          await fetch(
            env.DISCORD_WEBHOOK,
            {

              method:
                "POST",

              headers: {

                "Content-Type":
                  "application/json"

              },

              body:
                JSON.stringify(
                  discordPayload
                )

            }
          );


        if (
          !discordResponse.ok
        ) {

          const discordError =
            await discordResponse.text();


          return new Response(

            "Discord error: " +
            discordError,

            {

              status: 502,

              headers:
                corsHeaders

            }

          );

        }


        return new Response(
          "Payment attempt recorded",
          {

            status: 200,

            headers:
              corsHeaders

          }
        );

      }


      /* ===================================================
         COPPERX WEBHOOK
      =================================================== */

      const eventType =
        data.type ||
        "Unknown event";


      /* ===================================================
         IGNORE COPPERX ENDPOINT TEST
      =================================================== */

      if (
        eventType ===
        "webhook_endpoint_test"
      ) {

        return new Response(
          "Webhook test received",
          {

            status: 200,

            headers:
              corsHeaders

          }
        );

      }


      /* ===================================================
         EXTRACT COPPERX OBJECT
      =================================================== */

      const object =
        data?.data?.object ||
        data?.data ||
        data?.object ||
        {};


      /* ===================================================
         EMAIL
      =================================================== */

      const email =
        object.email ||
        object.customerEmail ||
        object.customer?.email ||
        "Not provided";


      /* ===================================================
         AMOUNT
      =================================================== */

      const amount =
        object.amount ||
        object.amountPaid ||
        object.total ||
        "Not provided";


      /* ===================================================
         CURRENCY
      =================================================== */

      const currency =
        object.currency ||
        object.currencyCode ||
        object.asset ||
        "Unknown";


      /* ===================================================
         STATUS
      =================================================== */

      const status =
        object.status ||
        object.paymentStatus ||
        "Unknown";


      /* ===================================================
         CHECKOUT ID
      =================================================== */

      const checkoutId =
        object.id ||
        data.id ||
        "Unknown";


      /* ===================================================
         PAYMENT LINK
      =================================================== */

      const paymentLink =
        object.paymentLinkId ||
        object.payment_link_id ||
        object.paymentLink?.id ||
        "";


      /* ===================================================
         DETERMINE TIER
      =================================================== */

      let tier =
        "Unknown";


      if (
        paymentLink ===
        "7cb6c455-86f8-4d72-8985-ccf5ee45d866"
      ) {

        tier =
          "Chill Trader";

      }


      if (
        paymentLink ===
        "a9ac9a9f-0076-4863-819e-dcf617cd5028"
      ) {

        tier =
          "Savage Trader";

      }


      /* ===================================================
         COPPERX DISCORD MESSAGE
      =================================================== */

      const discordPayload = {

        username:
          "FuturesMove Payments",


        embeds: [

          {

            title:
              "💸 COPPERX PAYMENT EVENT",


            description:
              "Copperx has sent a new payment event.",


            fields: [

              {

                name:
                  "📧 Email",

                value:
                  email,

                inline: true

              },


              {

                name:
                  "🏷️ Tier",

                value:
                  tier,

                inline: true

              },


              {

                name:
                  "💰 Amount",

                value:
                  `${amount} ${currency}`,

                inline: true

              },


              {

                name:
                  "📊 Status",

                value:
                  status,

                inline: true

              },


              {

                name:
                  "⚡ Event",

                value:
                  eventType,

                inline: true

              },


              {

                name:
                  "🆔 Checkout ID",

                value:
                  checkoutId,

                inline: false

              }

            ],


            footer: {

              text:
                "FuturesMove • Verify payment in Copperx before granting access"

            },


            timestamp:
              new Date().toISOString()

          }

        ]

      };


      /* ===================================================
         SEND COPPERX EVENT TO DISCORD
      =================================================== */

      const discordResponse =
        await fetch(
          env.DISCORD_WEBHOOK,
          {

            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json"

            },

            body:
              JSON.stringify(
                discordPayload
              )

          }
        );


      if (
        !discordResponse.ok
      ) {

        const discordError =
          await discordResponse.text();


        return new Response(

          "Discord error: " +
          discordError,

          {

            status: 502,

            headers:
              corsHeaders

          }

        );

      }


      /* ===================================================
         SUCCESS
      =================================================== */

      return new Response(
        "OK",
        {

          status: 200,

          headers:
            corsHeaders

        }
      );


    } catch (error) {

      /* ===================================================
         ERROR
      =================================================== */

      return new Response(

        "Worker error: " +
        error.toString(),

        {

          status: 500,

          headers:
            corsHeaders

        }

      );

    }

  }

};
