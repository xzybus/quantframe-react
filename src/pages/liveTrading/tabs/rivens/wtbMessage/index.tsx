import { ActionIcon, Grid, Group, TextInput, Tooltip, Image, Text, Box, List } from "@mantine/core";
import { useCacheContext } from "@contexts/index";
import AvailableRivens from "./availableRivens";
import { useLocalStorage } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useTranslatePage, useTranslateRustError } from "@hooks/index";
import { modals } from "@mantine/modals";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faDollarSign, faEdit, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { wfmThumbnail } from "@api/index";
import { useMutation } from "@tanstack/react-query";
import { generateWtbMessage } from "./helper";
import { OffTauriEvent, SendNotificationToWindow, OnTauriEvent, paginate, sortArray } from "@utils/index";
import { SearchField } from "@components/searchfield";
import { notifications } from "@mantine/notifications";
import { Wfm, RustError } from "$types/index";
import { TextColor } from "@components/textColor";


export interface WTBEntry {
  url: string;
  name: string;
  icon: string;
  price: number;
  auctions?: Wfm.Auction<Wfm.AuctionOwner>[];
  hidden?: boolean;
}
export default function WTBMessagePage() {
  const useTranslateWTBMessage = (key: string, context?: { [key: string]: any }) => useTranslatePage(`wtbMessage.${key}`, { ...context })
  const useTranslateDataGrid = (key: string, context?: { [key: string]: any }) => useTranslateWTBMessage(`datagrid.${key}`, { ...context })
  const useTranslateDataGridColumns = (key: string, context?: { [key: string]: any }) => useTranslateDataGrid(`columns.${key}`, { ...context });

  useCacheContext();
  const [wtbList, setWtbList] = useLocalStorage<WTBEntry[]>({ key: "wtbList", defaultValue: [] });
  const [wtbMessage, setWtbMessage] = useState<string>("");

  // States For DataGrid
  const [page, setPage] = useState(1);
  const pageSizes = [5, 10, 15, 20, 25, 30, 50, 100];
  const [pageSize, setPageSize] = useState(pageSizes[4]);
  const [rows, setRows] = useState<WTBEntry[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'price', direction: 'desc' });
  const [query, setQuery] = useState<string>("");
  const [messageTemplate, setMessageTemplate] = useLocalStorage<string>({ key: "wtbMessageTemplate", defaultValue: "WTB RIVENS FOR [WTB]" });


  // Update DataGrid Rows
  useEffect(() => {
    if (!wtbList)
      return;
    let rivensFilter = wtbList;
    if (query !== "") {
      rivensFilter = rivensFilter.filter((riven) => riven.name.toLowerCase().includes(query.toLowerCase()));
    }

    setTotalRecords(rivensFilter.length);
    rivensFilter = sortArray([{
      field: sortStatus.columnAccessor,
      direction: sortStatus.direction
    }], rivensFilter);
    rivensFilter = paginate(rivensFilter, page, pageSize);
    setRows(rivensFilter);
  }, [wtbList, query, pageSize, page, sortStatus])

  const [progressState, setProgressState] = useState<{
    [key: string]: {
      total: number,
      current: number,
      message: string
    }
  }>({});
  useEffect(() => {
    // Group by price
    const groupByPrice: Record<number, WTBEntry[]> = {};
    wtbList.sort((a, b) => a.price - b.price).forEach((riven) => {
      if (!groupByPrice[riven.price])
        groupByPrice[riven.price] = [];
      groupByPrice[riven.price].push(riven);
    })

    // Create message
    // Sort by price
    const prices = Object.keys(groupByPrice).map((key) => parseInt(key)).sort((a, b) => b - a);

    const message = prices.map((key) => {
      const rivens = groupByPrice[key];
      const msg = rivens.map((riven) => `[${riven.name}]`).join("");
      return `${msg}${key}`;
    }).join(" ");
    setWtbMessage(messageTemplate.replace("[WTB]", message));
  }, [wtbList, messageTemplate])

  // Http Requests
  const generateWtbMessageMutation = useMutation((data: { rivenTypes: WTBEntry[], minSellers: number, lowestPrice: number, discount: number }) =>
    generateWtbMessage(data.rivenTypes, data.minSellers, data.lowestPrice, data.discount), {
    onSuccess: async (data) => {
      modals.openConfirmModal({
        title: useTranslateWTBMessage('modals.generateWtbMessage.title'),
        children: (
          <Box>
            <Text>{useTranslateWTBMessage('modals.generateWtbMessage.description')}</Text>
            <List>
              {data.map((riven) =>
                <List.Item key={riven.url}>
                  <TextColor color="gray.7" i18nKey="pages.wtbMessage.modals.generateWtbMessage.list_text" values={{ name: riven.name, price: riven.price, previousPrice: riven.previousPrice }} />
                </List.Item>)
              }
            </List>
          </Box>
        ),
        labels: {
          confirm: useTranslateWTBMessage('modals.generateWtbMessage.confirm'),
          cancel: useTranslateWTBMessage('modals.generateWtbMessage.cancel')
        },
        confirmProps: { color: 'red' },
        onConfirm: async () => {
          if (!data[0])
            return;
          setWtbList(data)
        }
      })
    },
    onError(error: RustError) {
      SendNotificationToWindow(useTranslateRustError("title", { component: error.component }), useTranslateRustError("message", { loc: error.component }));
    }
  })

  // Hook on tauri events from rust side
  useEffect(() => {
    OnTauriEvent("GenerateWtbMessage:Progress", (data: {
      id: string, data: {
        total: number,
        current: number,
        message: string,
        isCompleted: boolean,
      }
    }) => {
      const newProgressState = { ...progressState };
      newProgressState[data.id] = data.data;
      notifications.update({
        id: data.id,
        color: 'teal',
        title: `Calculating ${data.data.current}/${data.data.total}`,
        message: data.data.message,
        autoClose: data.data.isCompleted,
        withCloseButton: data.data.isCompleted,
      });
      setProgressState(newProgressState);
    });
    return () => {
      OffTauriEvent("Cache:Update:Items");
    }
  }, []);


  return (
    <Grid>
      <Grid.Col md={6}>
        <AvailableRivens onAddRiven={(riven) => {
          if (wtbList.find((r) => r.url === riven.url_name))
            return;
          setWtbList([...wtbList, { name: riven.item_name, icon: riven.icon, url: riven.url_name, price: 0 }]);
        }} />
      </Grid.Col>
      <Grid.Col md={6}>
        <SearchField value={query} onChange={(text) => setQuery(text)}
          rightSectionWidth={75}
          rightSection={
            <>
              <Tooltip label={useTranslateWTBMessage('tooltip.calculate_price')}>
                <ActionIcon variant="filled" color="blue.7" onClick={() => {
                  modals.openContextModal({
                    modal: 'prompt',
                    title: useTranslateWTBMessage("prompt.generateWtbMessage.title"),
                    innerProps: {
                      fields: [
                        {
                          name: 'minSellers',
                          label: useTranslateWTBMessage("prompt.generateWtbMessage.minSellers_label"),
                          value: 15,
                          type: 'number',
                          attributes: {
                            description: useTranslateWTBMessage("prompt.generateWtbMessage.minSellers_description"),
                            placeholder: useTranslateWTBMessage("prompt.generateWtbMessage.minSellers_placeholder"),
                          },
                        },
                        {
                          name: 'lowestPrice',
                          label: useTranslateWTBMessage("prompt.generateWtbMessage.lowestPrice_label"),
                          type: 'number',
                          value: 50,
                          attributes: {
                            description: useTranslateWTBMessage("prompt.generateWtbMessage.lowestPrice_description"),
                            placeholder: useTranslateWTBMessage("prompt.generateWtbMessage.lowestPrice_placeholder"),
                          },
                        },
                        {
                          name: 'discount',
                          label: useTranslateWTBMessage("prompt.generateWtbMessage.discount_label"),
                          type: 'number',
                          value: 0.5,
                          attributes: {
                            description: useTranslateWTBMessage("prompt.generateWtbMessage.discount_description"),
                            placeholder: useTranslateWTBMessage("prompt.generateWtbMessage.discount_placeholder"),
                            precision: 2,
                            step: 0.05,
                            max: 1,
                          }
                        }
                      ],
                      onConfirm: async (data: { minSellers: number, lowestPrice: number, discount: number }) => {
                        const { minSellers, lowestPrice, discount } = data;
                        notifications.show({
                          id: "generate-wtb-message",
                          loading: true,
                          title: 'Loading your data',
                          message: 'Data will be loaded in 3 seconds, you cannot close this yet',
                          autoClose: false,
                          withCloseButton: false,
                        });

                        generateWtbMessageMutation.mutate({
                          rivenTypes: wtbList,
                          minSellers: minSellers,
                          lowestPrice: lowestPrice,
                          discount: discount,
                        });
                      },
                      onCancel: (id: string) => modals.close(id),
                    },
                  })
                }}>
                  <FontAwesomeIcon icon={faDollarSign} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label={useTranslateWTBMessage('tooltip.clear')}>
                <ActionIcon variant="filled" color="red.7" onClick={() => {
                  setWtbList([]);
                }}>
                  <FontAwesomeIcon icon={faTrashCan} />
                </ActionIcon>
              </Tooltip>
            </>
          }
        />
        <DataTable
          sx={{ marginTop: "20px" }}
          height={`calc(100vh - 225px)`}
          striped
          records={rows}
          page={page}
          onPageChange={setPage}
          totalRecords={totalRecords}
          recordsPerPage={pageSize}
          recordsPerPageOptions={pageSizes}
          onRecordsPerPageChange={setPageSize}
          sortStatus={sortStatus}
          onSortStatusChange={setSortStatus}
          // define columns
          columns={[
            {
              accessor: 'name',
              title: useTranslateDataGridColumns("name"),
              sortable: true,
              render: ({ name, icon }) =>
                <Group >
                  <Image width={48} height={48} fit="contain" src={wfmThumbnail(icon || "")} />
                  {name}
                </Group>
            },
            {
              accessor: 'price',
              title: useTranslateDataGridColumns("bought_price"),
              sortable: true,
            },
            {
              accessor: 'actions',
              title: useTranslateDataGridColumns("actions.title"),
              width: 150,
              render: ({ url, price }) =>
                <Group>
                  <Tooltip label={useTranslateDataGridColumns("actions.edit")}>
                    <ActionIcon color="blue.9" variant="filled" size={"sm"} onClick={async () => {
                      modals.openContextModal({
                        modal: 'prompt',
                        title: useTranslateWTBMessage("prompt.sell_price.title"),
                        innerProps: {
                          fields: [{ name: 'price', description: useTranslateWTBMessage("prompt.sell_price.description"), label: useTranslateWTBMessage("prompt.sell_price.label"), type: 'number', value: price, placeholder: useTranslateWTBMessage("prompt.sell_price.placeholder") }],
                          onConfirm: async (data: { price: number }) => {

                            if (data.price <= 0)
                              return;
                            const newWtbList = [...wtbList];
                            const index = newWtbList.findIndex((r) => r.url === url);
                            if (index === -1)
                              return;
                            newWtbList[index].price = data.price;
                            setWtbList(newWtbList);

                          },
                          onCancel: (id: string) => modals.close(id),
                        },
                      })
                    }}>
                      <FontAwesomeIcon icon={faEdit} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label={useTranslateDataGridColumns("actions.delete")}>
                    <ActionIcon color="red.7" size={"sm"} variant="filled" onClick={async () => {
                      const newWtbList = [...wtbList];
                      const index = newWtbList.findIndex((r) => r.url === url);
                      if (index === -1)
                        return;
                      newWtbList.splice(index, 1);
                      setWtbList(newWtbList);
                    }}>
                      <FontAwesomeIcon size="1x" icon={faTrashCan} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
            },
          ]}
        />
        <Group grow>
          <TextInput
            label={useTranslateWTBMessage('wtb_message_template')}
            value={messageTemplate}
            onChange={(e) => setMessageTemplate(e.currentTarget.value || "")}
          />
          <TextInput
            readOnly
            label={useTranslateWTBMessage("wtb_message")}
            value={wtbMessage}
            error={wtbMessage.length > 181 ? useTranslateWTBMessage("wtb_message_max_length", {
              length: wtbMessage.length,
              maxLength: 181
            }) : undefined}
            rightSection={
              <Group>
                <Tooltip label={useTranslateWTBMessage("copy_to_clipboard")}>
                  <ActionIcon color="blue.7" size={"sm"} variant="filled" onClick={async () => {
                    await navigator.clipboard.writeText(wtbMessage);
                    notifications.show({
                      title: useTranslateWTBMessage("notifaications.copied_to_clipboard"),
                      message: wtbMessage,
                      color: "blue",
                      autoClose: 2000,
                    })
                  }}>
                    <FontAwesomeIcon size="1x" icon={faCopy} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            }
          />
        </Group>
      </Grid.Col>
    </Grid>
  );
}
