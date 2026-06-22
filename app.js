const documentDateInput = document.querySelector("#documentDate");
const productForm = document.querySelector("#productForm");
const productTypeInput = document.querySelector("#productType");
const fieldContainer = document.querySelector("#fieldContainer");
const productList = document.querySelector("#productList");
const emptyState = document.querySelector("#emptyState");
const downloadButton = document.querySelector("#downloadDoc");

const productTypes = [
  {
    id: "metal-whiteboards",
    title: "Metal Whiteboards",
    fields: [
      {
        id: "size",
        label: "Size",
        type: "select",
        options: ["A5", "A4", "A3"],
      },
      {
        id: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Enter the product description",
      },
      {
        id: "addOns",
        label: "Add Ons",
        type: "select",
        options: ["Command Strips", "Magnets", "Pen Only"],
      },
      {
        id: "postage",
        label: "Postage",
        type: "select",
        options: ["1st Class", "2nd Class"],
      },
    ],
  },
  {
    id: "metal-wallet-cards",
    title: "Metal Wallet Cards",
    fields: [
      {
        id: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Enter the product description",
      },
      {
        id: "text",
        label: "Text",
        type: "textarea",
        placeholder: "Enter the text for the card",
      },
      {
        id: "cardColour",
        label: "Card Colour",
        type: "select",
        options: ["White"],
      },
      {
        id: "postage",
        label: "Postage",
        type: "select",
        options: ["1st Class", "2nd Class"],
      },
    ],
  },
  {
    id: "metal-keyrings",
    title: "Metal Keyrings",
    fields: [
      {
        id: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Enter the product description",
      },
      {
        id: "text",
        label: "Text",
        type: "textarea",
        placeholder: "Enter the text for the keyring",
      },
      {
        id: "keyringColour",
        label: "Keyring Colour",
        type: "select",
        options: ["White", "Silver"],
      },
      {
        id: "postage",
        label: "Postage",
        type: "select",
        options: ["1st Class", "2nd Class"],
      },
    ],
  },
  {
    id: "cushions",
    title: "Cushions",
    fields: [
      {
        id: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Enter the product description",
      },
      {
        id: "innerIncluded",
        label: "Inner Included",
        type: "select",
        options: ["Yes", "No"],
      },
      {
        id: "postage",
        label: "Postage",
        type: "select",
        options: ["1st Class", "2nd Class"],
      },
    ],
  },
  {
    id: "ceramic-discs",
    title: "Ceramic Discs",
    fields: [
      {
        id: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Enter the product description",
      },
      {
        id: "title",
        label: "Title",
        type: "text",
        placeholder: "Enter the disc title",
      },
      {
        id: "postage",
        label: "Postage",
        type: "select",
        options: ["1st Class", "2nd Class"],
      },
    ],
  },
  {
    id: "flags",
    title: "Flags",
    fields: [
      {
        id: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Enter the product description",
      },
      {
        id: "postage",
        label: "Postage",
        type: "select",
        options: ["1st Class", "2nd Class"],
      },
    ],
  },
  {
    id: "metal-signs",
    title: "Metal Signs",
    fields: [
      {
        id: "size",
        label: "Size",
        type: "select",
        options: ["A5", "A4", "A3"],
      },
      {
        id: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Enter the product description",
      },
      {
        id: "postage",
        label: "Postage",
        type: "select",
        options: ["1st Class", "2nd Class"],
      },
    ],
  },
];

const customerFields = [
  {
    id: "customerName",
    label: "Customer Name",
    type: "text",
  },
  {
    id: "customerAddress",
    label: "Customer Address",
    type: "textarea",
  },
];

const products = [];

documentDateInput.valueAsDate = new Date();
renderProductOptions();
renderSelectedProductFields();

productTypeInput.addEventListener("change", renderSelectedProductFields);

productForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const productType = getSelectedProductType();
  if (!productType) return;

  const formProduct = {
    id: crypto.randomUUID(),
    productTypeId: productType.id,
    title: productType.title,
    fields: productType.fields.map((field) => {
      const input = document.querySelector(`#${field.id}`);
      return {
        id: field.id,
        label: field.label,
        value: input.value.trim(),
      };
    }),
    customer: customerFields.map((field) => {
      const input = document.querySelector(`#${field.id}`);
      return {
        id: field.id,
        label: field.label,
        value: input.value.trim(),
      };
    }),
  };

  products.push(formProduct);
  resetProductFields(productType);
  resetCustomerFields();
  renderProducts();
});

downloadButton.addEventListener("click", () => {
  if (!products.length) return;

  const docxBlob = createDocx({
    date: documentDateInput.value,
    products,
  });
  downloadBlob(docxBlob, `DAILY-ORDER-FORM-${formatFilenameDate(documentDateInput.value)}.docx`);
});

function renderProducts() {
  productList.innerHTML = "";
  emptyState.hidden = products.length > 0;
  downloadButton.disabled = products.length === 0;

  groupProductsByTitle(products).forEach((group) => {
    const groupItem = document.createElement("li");
    groupItem.className = "product-group";
    groupItem.innerHTML = `
      <h3>${escapeHtml(group.title)}</h3>
      <div class="group-items">
        ${group.customers.map((customerGroup) => `
          <section class="customer-group">
            <div class="customer-block">
              <strong>Customer</strong>
              <span>${formatPreviewAddress(customerGroup.customer)}</span>
            </div>
            <div class="customer-items">
              ${customerGroup.items.map((product, index) => `
                <article class="product-card">
                  <div class="product-card-header">
                    <span class="entry-label">Item ${index + 1}</span>
                    <button class="remove-button" type="button" aria-label="Remove product" data-id="${product.id}">×</button>
                  </div>
                  <div class="details">
                    ${product.fields.map((field) => `
                      <div class="detail ${field.id === "description" ? "description-detail" : ""}">
                        <strong>${escapeHtml(field.label)}</strong>
                        <span>${escapeHtml(field.value)}</span>
                      </div>
                    `).join("")}
                  </div>
                </article>
              `).join("")}
            </div>
          </section>
        `).join("")}
      </div>
    `;
    productList.append(groupItem);
  });
}

function renderProductOptions() {
  productTypes.forEach((productType) => {
    const option = document.createElement("option");
    option.value = productType.id;
    option.textContent = productType.title;
    productTypeInput.append(option);
  });
}

function renderSelectedProductFields() {
  const productType = getSelectedProductType();
  fieldContainer.innerHTML = "";

  if (!productType) {
    fieldContainer.innerHTML = `<div class="field-placeholder">Choose a product to begin.</div>`;
    return;
  }

  productType.fields.forEach((field) => {
    fieldContainer.append(createFieldControl(field));
  });

  const customerSection = document.createElement("div");
  customerSection.className = "customer-fields";
  customerFields.forEach((field) => {
    customerSection.append(createFieldControl(field));
  });
  fieldContainer.append(customerSection);
}

function createFieldControl(field) {
  const label = document.createElement("label");
  label.setAttribute("for", field.id);
  label.innerHTML = `<span>${escapeHtml(field.label)}</span>`;

  if (field.type === "textarea") {
    const textarea = document.createElement("textarea");
    textarea.id = field.id;
    textarea.name = field.id;
    textarea.rows = field.id === "customerAddress" ? 4 : 5;
    textarea.required = true;
    textarea.placeholder = field.placeholder || "";
    label.append(textarea);
  }

  if (field.type === "select") {
    const select = document.createElement("select");
    select.id = field.id;
    select.name = field.id;
    select.required = true;
    select.append(new Option(`Choose ${field.label.toLowerCase()}`, ""));
    field.options.forEach((optionValue) => {
      select.append(new Option(optionValue, optionValue));
    });
    label.append(select);
  }

  if (field.type === "text") {
    const input = document.createElement("input");
    input.id = field.id;
    input.name = field.id;
    input.type = "text";
    input.required = true;
    input.placeholder = field.placeholder || "";
    label.append(input);
  }

  return label;
}

function getSelectedProductType() {
  return productTypes.find((productType) => productType.id === productTypeInput.value);
}

function resetProductFields(productType) {
  productType.fields.forEach((field) => {
    const input = document.querySelector(`#${field.id}`);
    if (input) input.value = "";
  });
}

function resetCustomerFields() {
  customerFields.forEach((field) => {
    const input = document.querySelector(`#${field.id}`);
    if (input) input.value = "";
  });
}

function formatPreviewAddress(customer) {
  const name = customer.find((field) => field.id === "customerName")?.value || "";
  const address = customer.find((field) => field.id === "customerAddress")?.value || "";
  return escapeHtml([name, address].filter(Boolean).join("\n")).replaceAll("\n", "<br>");
}

function groupProductsByTitle(productItems) {
  const groups = [];
  productItems.forEach((product) => {
    let group = groups.find((existingGroup) => existingGroup.title === product.title);
    if (!group) {
      group = { title: product.title, customers: [] };
      groups.push(group);
    }

    const customerKey = getCustomerKey(product.customer);
    let customerGroup = group.customers.find((existingGroup) => existingGroup.key === customerKey);
    if (!customerGroup) {
      customerGroup = {
        key: customerKey,
        customer: product.customer,
        items: [],
      };
      group.customers.push(customerGroup);
    }

    customerGroup.items.push(product);
  });
  return groups;
}

function getCustomerKey(customer) {
  const name = customer.find((field) => field.id === "customerName")?.value || "";
  const address = customer.find((field) => field.id === "customerAddress")?.value || "";
  return `${normaliseCustomerText(name)}|${normaliseCustomerText(address)}`;
}

function normaliseCustomerText(value) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

productList.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".remove-button");
  if (!removeButton) return;

  const index = products.findIndex((product) => product.id === removeButton.dataset.id);
  if (index >= 0) {
    products.splice(index, 1);
    renderProducts();
  }
});

function createDocx({ date, products }) {
  const prettyDate = formatDate(date);
  const documentXml = buildDocumentXml(prettyDate, products);
  const files = {
    "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`,
    "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
    "word/_rels/document.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`,
    "word/styles.xml": buildStylesXml(),
    "word/document.xml": documentXml,
  };

  return new Blob([zipFiles(files)], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

function buildDocumentXml(prettyDate, products) {
  const productBlocks = groupProductsByTitle(products).map((group) => `
    ${paragraph(group.title, "ProductTitle")}
    ${paragraph("", "ProductTitleGap")}
    ${group.customers.map((customerGroup, customerIndex) => `
      ${customerIndex > 0 ? paragraph("", "CustomerSeparator") : ""}
      ${customerGroup.items.map((product, productIndex) => `
        ${product.fields.filter((field) => field.id !== "postage").map((field) => fieldParagraph(field.label, field.value)).join("")}
        ${productIndex < customerGroup.items.length - 1 ? paragraph("", "ItemGap") : ""}
      `).join("")}
      ${postageParagraph(customerGroup.items)}
      ${paragraph("", "CustomerGap")}
      ${customerParagraphs(customerGroup.customer)}
      ${paragraph("", "Normal")}
    `).join("")}
  `).join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraph(`Products for ${prettyDate}`, "Title")}
    ${paragraph("", "TitleGap")}
    ${productBlocks}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

function paragraph(text, style) {
  const format = paragraphFormat(style);
  return `<w:p>
    <w:pPr>
      <w:pStyle w:val="${style}"/>
      ${format.paragraph}
    </w:pPr>
    <w:r>
      ${format.run}
      <w:t xml:space="preserve">${escapeXml(text)}</w:t>
    </w:r>
  </w:p>`;
}

function paragraphFormat(style) {
  const formats = {
    Title: {
      paragraph: `<w:spacing w:after="260"/>`,
      run: `<w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:sz w:val="44"/><w:color w:val="465352"/></w:rPr>`,
    },
    TitleGap: {
      paragraph: `<w:spacing w:before="0" w:after="120"/>`,
      run: `<w:rPr><w:sz w:val="4"/></w:rPr>`,
    },
    ProductTitle: {
      paragraph: `<w:spacing w:before="120" w:after="180"/>`,
      run: `<w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:sz w:val="34"/><w:color w:val="263031"/></w:rPr>`,
    },
    ProductTitleGap: {
      paragraph: `<w:spacing w:before="0" w:after="80"/>`,
      run: `<w:rPr><w:sz w:val="4"/></w:rPr>`,
    },
    CustomerGap: {
      paragraph: `<w:spacing w:before="120" w:after="160"/>`,
      run: `<w:rPr><w:sz w:val="4"/></w:rPr>`,
    },
    ItemGap: {
      paragraph: `<w:spacing w:before="80" w:after="140"/>`,
      run: `<w:rPr><w:sz w:val="4"/></w:rPr>`,
    },
    CustomerSeparator: {
      paragraph: `<w:spacing w:before="220" w:after="180"/><w:pBdr><w:bottom w:val="single" w:sz="8" w:space="1" w:color="B7C2C8"/></w:pBdr>`,
      run: `<w:rPr><w:sz w:val="4"/></w:rPr>`,
    },
    Customer: {
      paragraph: `<w:spacing w:after="80" w:line="276" w:lineRule="auto"/>`,
      run: `<w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="22"/></w:rPr>`,
    },
  };

  return formats[style] || { paragraph: "", run: "" };
}

function fieldParagraph(label, value) {
  return `<w:p>
    <w:pPr><w:pStyle w:val="Normal"/></w:pPr>
    <w:r><w:rPr><w:b/></w:rPr><w:t>${escapeXml(label)}: </w:t></w:r>
    <w:r><w:t xml:space="preserve">${escapeXml(value)}</w:t></w:r>
  </w:p>`;
}

function postageParagraph(items) {
  const postageValues = items
    .map((item) => item.fields.find((field) => field.id === "postage")?.value || "")
    .filter(Boolean);
  const uniquePostageValues = [...new Set(postageValues)];

  if (!uniquePostageValues.length) return "";
  return fieldParagraph("Postage", uniquePostageValues.join(" / "));
}

function customerParagraphs(customer) {
  const name = customer.find((field) => field.id === "customerName")?.value || "";
  const address = customer.find((field) => field.id === "customerAddress")?.value || "";
  const lines = [name, ...address.split(/\r?\n/).map((line) => line.trim())].filter(Boolean);
  return lines.map((line) => paragraph(line, "Customer")).join("");
}

function buildStylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="22"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:after="260"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:sz w:val="44"/><w:color w:val="465352"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="TitleGap">
    <w:name w:val="Title Gap"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:after="120"/></w:pPr>
    <w:rPr><w:sz w:val="4"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="ProductTitle">
    <w:name w:val="Product Title"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="120" w:after="180"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:sz w:val="34"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="ProductTitleGap">
    <w:name w:val="Product Title Gap"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:after="80"/></w:pPr>
    <w:rPr><w:sz w:val="4"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Customer">
    <w:name w:val="Customer"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:after="80" w:line="276" w:lineRule="auto"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="22"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="CustomerGap">
    <w:name w:val="Customer Gap"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="120" w:after="160"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="4"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="ItemGap">
    <w:name w:val="Item Gap"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="80" w:after="140"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="4"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="CustomerSeparator">
    <w:name w:val="Customer Separator"/>
    <w:qFormat/>
    <w:pPr>
      <w:spacing w:before="220" w:after="180"/>
      <w:pBdr>
        <w:bottom w:val="single" w:sz="8" w:space="1" w:color="B7C2C8"/>
      </w:pBdr>
    </w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="4"/></w:rPr>
  </w:style>
</w:styles>`;
}

function zipFiles(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  Object.entries(files).forEach(([name, content]) => {
    const nameBytes = encoder.encode(name);
    const contentBytes = encoder.encode(content);
    const crc = crc32(contentBytes);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, 0, true);
    localView.setUint16(12, 0, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, contentBytes.length, true);
    localView.setUint32(22, contentBytes.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localView.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader, contentBytes);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, 0, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, contentBytes.length, true);
    centralView.setUint32(24, contentBytes.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);
    centralParts.push(centralHeader);

    offset += localHeader.length + contentBytes.length;
  });

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, Object.keys(files).length, true);
  endView.setUint16(10, Object.keys(files).length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);

  return new Blob([...localParts, ...centralParts, endRecord]);
}

function crc32(bytes) {
  let crc = -1;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let value = i;
    for (let j = 0; j < 8; j += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[i] = value >>> 0;
  }
  return table;
})();

function formatDate(dateValue) {
  if (!dateValue) return "No date selected";
  const date = new Date(`${dateValue}T12:00:00`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatFilenameDate(dateValue) {
  const date = dateValue ? new Date(`${dateValue}T12:00:00`) : new Date();
  const day = new Intl.DateTimeFormat("en-GB", { day: "numeric" }).format(date);
  const month = new Intl.DateTimeFormat("en-GB", { month: "long" }).format(date);
  return `${day}-${month}`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
